const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight
    
//class for creating the boundaries which will become the main layout for the map
class Boundary{
    static width = 40
    static height = 40
    constructor({position, image}){
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }
    draw(){
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

//class for creating the player or "pacman"
class Player {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = .75
        this.openRate = 0.06
        this.rotation = 0
    }
     draw(){
        c.save()

        //this is for rotating pacman in the direction of movement
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)


        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 -this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        //makes the pacman open and close his mouth
        if(this.radians < 0 || this.radians > .75)
            this.openRate = -this.openRate
            this.radians += this.openRate  
    }
}


//class for the enemies
class Ghost {
    static speed = 2
    constructor({position, velocity, color = 'red', image}){
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
        this.image = image  
        
    }

    draw(){
        //the image or the ghost needs to be moved onto a circle which was initially used to make the game
        //for collision detection
        c.drawImage(this.image, this.position.x - 20, this.position.y -20)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.closePath()
    }
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

//class for pacman's food pellets which I have replaced with electricity bolts
class Pellet {
    static width = 40
    static height = 40
    
    constructor({position, image}){
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image 
        
    }

    draw(){
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}


//powerup which I have replaced with solar panels
class PowerUp {
    constructor({position, image}){
        this.position = position
        this.image = image
        this.width = 40
        this.height = 40
    }

    draw(){
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}



const powerUps = []
const pellets = []
const boundaries = []
const ghosts = [
    new Ghost({
    position:{
        //X and y are being usend to position the enemies around the map, you can move enemy 1
        // 6 blocks to the right by multiplying it with the boundary width, the same can be done with y
        // if you would like to move the enemy down
        x: Boundary.width * 6 + Boundary.width/2,
        y: Boundary.height + Boundary.height/2
    },
    velocity:{
        x:Ghost.speed,
        y:0
    },
    image:
    createImage('./img/redGhost.png')
    
}),
    new Ghost({
    position:{
        x: Boundary.width * 6 + Boundary.width/2,
        y: Boundary.height * 3 + Boundary.height/2
    },
    velocity:{
        x:Ghost.speed,
        y:0
    },
    image:
        createImage('./img/pinkGhost.png')
    
}),
 new Ghost({
    position:{
        x: Boundary.width  + Boundary.width/2,
        y: Boundary.height * 11 + Boundary.height/2
    },
    velocity:{
        x:Ghost.speed,
        y:0
    },
    image:createImage('./img/orangeGhost.png')
})
]
const player = new Player({
    position: {
        //this is the starting position of the player
        x: Boundary.width + Boundary.width/2,
        y: Boundary.height + Boundary.height/2
    },
    velocity: {
        x:0,
        y:0
    }
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

let lastKey = ''

let score = 0

const map = [

    // this is the layout for the map, it can be changed easily by adding rows or columns with the specific
    // symbols used below.
    ['1', '-', '-', '-', '-', '-', '-', '-', '-','-',  '2'],
    ['|', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
  ]


function createImage(src){
    const image = new Image()
    image.src = src
    return image
}


map.forEach((row, i ) => {
    row.forEach((symbol, j) => {
        switch(symbol) {
            //each case represents one of the symbols, new symbols can be added here
            case '-':
                boundaries.push(new Boundary({
                    position: {
                        x:Boundary.width * j,
                        y:Boundary.height * i
                    },
                    image: createImage('./img/pipeHorizontal.png')
                })
                )
                break
            case '|':
                boundaries.push(new Boundary({
                    position: {
                        x:Boundary.width * j,
                        y:Boundary.height * i
                    },
                    image: createImage('./img/pipeVertical.png')
                })
                )
                break
            case '1':
                boundaries.push(new Boundary({
                    position: {
                        x:Boundary.width * j,
                        y:Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner1.png')
                })
                )
                break
            case '2':
                boundaries.push(new Boundary({
                    position: {
                        x:Boundary.width * j,
                        y:Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner2.png')
                })
                )
                break
            case '3':
                boundaries.push(new Boundary({
                    position: {
                        x:Boundary.width * j,
                        y:Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner3.png')
                })
                )
                break
            case '4':
                boundaries.push(new Boundary({
                    position: {
                        x:Boundary.width * j,
                        y:Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner4.png')
                })
                )
                break
                case 'b':
                boundaries.push(new Boundary({
                    position: {
                        x:Boundary.width * j,
                        y:Boundary.height * i
                    },
                    image: createImage('./img/block.png')
                })
                )
                break
                case '[':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capLeft.png')
          })
        )
        break
      case ']':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capRight.png')
          })
        )
        break
      case '_':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capBottom.png')
          })
        )
        break
      case '^':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capTop.png')
          })
        )
        break
      case '+':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeCross.png')
          })
        )
        break
      case '5':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorTop.png')
          })
        )
        break
      case '6':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorRight.png')
          })
        )
        break
      case '7':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorBottom.png')
          })
        )
        break
      case '8':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeConnectorLeft.png')
          })
        )
        break
      case '.':
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/electricityBoltSpriteReal2.png')
          })
        )
        break
        case 'p':
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            }, 
            image: createImage('./img/solarReal.png')
          })
        )
        break
        }
    })
})


//these are the functions for the html buttons on the page
function restartGame(){
    window.location.reload()
}

function startGame(){
    requestAnimationFrame(animate)
}

function pauseGame(){
    cancelAnimationFrame(animationId)
}


//this function checks for collision by checking the different areas of the
// circles(ghost and player) and the boundaries or pellets
function circleCollidesWithRectangle({
    circle,
    rectangle
}){
    // the padding ensures that the circles do not get too close to the boundaries
    const padding = Boundary.width/2 - circle.radius - 1
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding && circle.position.x + circle.radius
        + circle.velocity.x >= rectangle.position.x - padding && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding && circle.position.x - circle.radius
        + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

// this function performs the same as the previous one just with the padding inversed
// so that the player has to go closer to the pellet to collect it
function circleCollidesWithPellet({
    circle,
    rectangle
}){
    const padding = Boundary.width/2 - circle.radius - 2
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height - padding && circle.position.x + circle.radius
        + circle.velocity.x >= rectangle.position.x + padding && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y + padding && circle.position.x - circle.radius
        + circle.velocity.x <= rectangle.position.x + rectangle.width - padding)
}


// animationId gets the current animation frame
let animationId

function animate(){
    
    animationId = requestAnimationFrame(animate)
    c.clearRect(0,0, canvas.width, canvas.height)

    // sets the player in motion in a specific direction depending on the key that was pressed
    if(keys.w.pressed && lastKey === 'w'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
        if (
            circleCollidesWithRectangle({
                circle: {...player, velocity: {
                    x: 0,
                    y: -5
                }},
                rectangle: boundary
            })
        ){
            player.velocity.y = 0
            break
        } else{
            player.velocity.y = -5
        }
    }
    } else if(keys.a.pressed && lastKey === 'a'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
        if (
            circleCollidesWithRectangle({
                circle: {...player, velocity: {
                    x: -5,
                    y: 0
                }},
                rectangle: boundary
            })
        ){
            player.velocity.x = 0
            break
        } else{
            player.velocity.x = -5
        }
    }
    } else if(keys.s.pressed && lastKey === 's'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
        if (
            circleCollidesWithRectangle({
                circle: {...player, velocity: {
                    x: 0,
                    y: 5
                }},
                rectangle: boundary
            })
        ){
            player.velocity.y = 0
            break
        } else{
            player.velocity.y = 5
        }
    }
    } else if(keys.d.pressed && lastKey === 'd'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
        if (
            circleCollidesWithRectangle({
                circle: {...player, velocity: {
                    x: 5,
                    y: 0
                }},
                rectangle: boundary
            })
        ){
            player.velocity.x = 0
            break
        } else{
            player.velocity.x = 5
        }
    }
    }

    //ghost touches player
    for(let i = ghosts.length - 1; 0 <= i; i--){
        const ghost = ghosts[i]
    if(Math.hypot(ghost.position.x - player.position.x, ghost.position.y - player.position.y) < ghost.radius + player.radius){
        if(ghost.scared){
            ghosts.splice(i, 1)
        }else{
        cancelAnimationFrame(animationId)

        }
    }
    }   

    //winning
    if(pellets.length == 0){
        cancelAnimationFrame(animationId)
        setTimeout(()=>{
            window.alert('YOU WIN!!!!!')
        },100)
        
    }

    // function for adding light ince powerup was collected
    function changeColor(color){
        const elem = document.getElementById('game') 
        elem.style.backgroundColor = color
        
    }

    //powerups
    for(let i = powerUps.length - 1; 0 <= i; i--){
        const powerUp = powerUps[i]
        powerUp.draw()
        //touches powerup
        if(circleCollidesWithPellet({circle: player, rectangle: powerUp})){
            powerUps.splice(i, 1)

            //scare ghosts
            
            changeColor('#ecd9c6')
            ghosts.forEach((ghost) => {
                ghost.scared = true
                setTimeout(() =>{
                    ghost.scared = false
                    changeColor('black')
                }, 7000)
            })
        }
    }

    //collision with pellet
    for(let i = pellets.length - 1; 0 <= i; i--){
        const pellet = pellets[i]
        pellet.draw()

         
        if(circleCollidesWithPellet({
            circle:player,
            rectangle:pellet
            })
            
        ){
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerHTML = score
        }
    }
   
    boundaries.forEach((boundary) => {
        boundary.draw()

        if (
            circleCollidesWithRectangle({
                circle: player,
                rectangle: boundary
            })
         ){
            player.velocity.x = 0
            player.velocity.y = 0
        }
    })
    
    player.update()

    ghosts.forEach(ghost => {
        ghost.update()
        
        //moving the enemies and pushing the collision direction into an array for changing direction
        const collisions = []
        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: ghost.speed,
                        y: 0
                    }},
                    rectangle: boundary
                })
            ) {
                collisions.push('right')
            }
            if (
                !collisions.includes('left') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: -ghost.speed,
                        y: 0
                    }},
                    rectangle: boundary
                })
            ) {
                collisions.push('left')
            }
            if (
                !collisions.includes('up') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: 0,
                        y: -ghost.speed
                    }},
                    rectangle: boundary
                })
            ) {
                collisions.push('up')
            }
            if (
                !collisions.includes('down') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: 0,
                        y: ghost.speed
                    }},
                    rectangle: boundary
                })
            ) {
                collisions.push('down')
            }
        })
        if(collisions.length > ghost.prevCollisions.length)
            ghost.prevCollisions = collisions
        
        
            //this is the code for giving the enemy the appearance of AI by moving
            // them in random directions where collisions are not detected
        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)){
            
            if(ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if(ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if(ghost.velocity.y < 0) ghost.prevCollisions.push('up')
            else if(ghost.velocity.y > 0) ghost.prevCollisions.push('down')
            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision)
            })
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch(direction){
                case 'down' : 
                ghost.velocity.y = ghost.speed
                ghost.velocity.x = 0
                break
                case 'up' : 
                ghost.velocity.y = -ghost.speed
                ghost.velocity.x = 0
                break
                case 'right' : 
                ghost.velocity.y = 0
                ghost.velocity.x = ghost.speed
                break
                case 'left' : 
                ghost.velocity.y = 0
                ghost.velocity.x = -ghost.speed
                break
            }
            ghost.prevCollisions = []
        }
        console.log(collisions)
    })
    if(player.velocity.x > 0) player.rotation = 0
    else if(player.velocity.x < 0) player.rotation = Math.PI
    else if(player.velocity.y > 0) player.rotation = Math.PI / 2
    else if(player.velocity.y < 0) player.rotation = Math.PI * 1.5
}

animate()


// event listeners to check keys being pressed for control of player
addEventListener('keydown', ({key}) => {
    switch(key){
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
        
        
    }
})

addEventListener('keyup', ({key}) => {
    switch(key){
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        
        
    }
})



