class Memory { 

    constructor() {

        // Elementos generales
        this.totalCards = []
        this.cardNumber = 0
        this.watch = []
        this.errors = 0
        this.difficulty = ""
        this.correctImages = []
        this.adder = []
        this.attempts = 5

        // Elementos html
        this.$container =  document.querySelector('.contenedor-general')
        this.$cardContainer =  document.querySelector('.contenedor-tarjetas')
        this.$lockScreen =  document.querySelector('.pantalla-bloqueada')
        this.$message =  document.querySelector('h2.mensaje')
        this.$errorContainer = document.createElement("div")
        this.$level = document.createElement("div")

        // Inicializamos la pantalla
        this.eventListeners()
        
    }

    // Cargar la pantalla
    eventListeners() {

        window.addEventListener("DOMContentLoaded", () => {

            // Seleccionamos la dificultad
            this.config()

            // Inicializamos la pantalla
            this.init()

            // Bloquemos el clic derecho para evitar buscar las respuestas por el html
            // window.addEventListener("contextmenu", e => {
            //     e.preventDefault()
            // }, false)

        })

    }

    // Seleccionar la dificultad
    config() {
        
        const message = prompt("Selecciona la dificultad: facil, intermedio o dificil, si no seleccionas ningun nivel por defecto será intermedio")

        switch (message) {
            case "facil":
                this.attempts = 9;
                this.difficulty = "Fácil"
                break;

            case "dificil":
                this.attempts = 5;
                this.difficulty = "Dificil"
                break;
        
            default:
                this.attempts = 7;
                this.difficulty = "Intermedio"
                break;
        }

    }

    // Leer las tarjetas
    async init () {
        
        // Leemos las tarjetas
        const response = await fetch("../memo.json")
        const json = await response.json()
        this.totalCards = json

        // Desordenamos las tarjetas
        if ( this.totalCards.length > 0 ) 
            this.totalCards.sort( (a,b) => { return Math.random() - 0.5 } )

        // Contamos las tarjetas
        this.cardNumber = this.totalCards.length

        let html = ""

        this.totalCards.forEach(card => {
            
            html = html + `
                <div class = "tarjeta">
                    <img class = "tarjeta-img" src = "${card.src}" alt = "Imagen memorama"/>
                </div>
            `

        });

        this.$cardContainer.innerHTML = html

        // Agregamos el clic en las tarjetas
        this.start()

        // Cargamos los errores
        this.errorContainer()

        // Mostramos la dificultad seleccionada
        this.showDificult()
            
    }

    // Iniciar juego
    start() {

        const cards = document.querySelectorAll('.tarjeta')

        cards.forEach(card => {
           
            card.addEventListener('click', e => {
               
                if ( !e.target.classList.contains("acertada") 
                    && !e.target.classList.contains("tarjeta-img"))
                    this.cardClicked(e)
                
            })            

        });

    }

    // Click sobre la tarjeta
    cardClicked(e) {

        // Mostramos la tarjeta
        this.effect(e)

        // Que imagen se le dio clic
        const source = e.target.querySelector("img").getAttribute("src")

        // Agregamos la tajeta que fue seleccionada
        this.watch.push( source )

        // Sacamos la tarjeta
        const card = e.target

        // Agremos toda la tarjeta, para voltearlas posteriormente unshit agrega al inicio
        this.adder.unshift( card )

        // Comparamos
        this.compare()

    }

    // Volter la tarjeta
    effect(e) {
        
        e.target.style.backgroundImage = "none"
        e.target.style.backgroundColor = "white"
        e.target.querySelector("img").style.display = "block"

    }

    // Fijar las tarjetas
    lockCard ( cards ) {
        
        cards.forEach(card => {
            
            // Agregamos las clases para fijar
            card.classList.add("acertada")

            // Agregamos la tarjeta a correctas
            this.correctImages.push( card )

            // Verificamos si ya se acabo el juego
            this.victory()

        });

    }

    // Mostrar el reverso de la tarjeta
    flipCards ( cards ) {
        
        cards.forEach(card => {
            
            setTimeout(() => {
                
                card.style.backgroundImage = "url(../img/cover.jpg)"
                card.querySelector("img").style.display = "none"

            }, 1000);

        });

    }

    // Comprar si las dos tarjetas seleccionadas
    compare() {
        
        if ( this.watch.length === 2 ) {

            if ( this.watch[0] === this.watch[1] ) this.lockCard( this.adder )
            else {

                this.errors = this.errors + 1

                // Regresamos las tarjetas a su posición
                this.flipCards( this.adder )

                // Verificamos si ya perdimos
                this.gameOver()

                // Actualizamos la pantalla
                this.showErrors()

            }

            // Vaciamos el vigilante
            this.watch.splice(0)

            // Vaciamos el agregador
            this.adder.splice(0)
        }
    }

    // Juego terminado con victoria
    victory() {
        
        if ( this.correctImages.length === this.cardNumber ) {

            setTimeout(() => {
                
                this.$lockScreen.style.display = "block"
                this.$message.innerText = "¡Felicidades ganaste!"

            }, 400);

            setTimeout(() => {
                
                // Recargamos la página
                location.reload()

            }, 5000);
        }

    }

    // Juego terminado por muchos erroes
    gameOver() {
        
        if ( this.errors === this.attempts ) {

            setTimeout(() => {

                this.$lockScreen.style.display = "block"

                const cards = document.querySelectorAll('.tarjeta')

                cards.forEach(card => {
                    
                    card.style.backgroundImage = "none"
                    card.style.backgroundColor = "white"
                    card.querySelector("img").style.display = "block"

                });

            }, 1200);

            setTimeout(() => {
                
                location.reload()

            }, 5500);

        }

    }

    // Mostrar el error en la pantalla
    showErrors() {
        
        this.$errorContainer.innerText = `
            Errores: ${this.errors}
        `

    }

    errorContainer() {
        
        this.$errorContainer.classList.add("error")
        this.showErrors()
        this.$container.appendChild(this.$errorContainer)

    }

    // Mostrar la dificultad
    showDificult() {
        
        this.$level.classList.add("nivel-dificultad")
        this.$level.innerHTML = `
            Dificultad: ${this.difficulty}
        `
        this.$container.appendChild(this.$level)
    }

}

new Memory()