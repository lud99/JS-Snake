class Snake
{
	constructor()
	{
		this.canvas = document.getElementById('snake');
		this.context = this.canvas.getContext('2d');
		this.context.scale(16, 16);

		this.board = {
			w: 17,
			h: 15
		}

		//Create snake
		this.snake = [{
			x: 4,
			y: 7
		},{
			x: 3,
			y: 7
		}];

		this.snakeColors = [
			'#4286f4', //Blue
			'#18c3d6', //Light Blue
			'#34ff28', //Light Green
			'#bf16ce', //Purple
			'#f91d1d', //Red
			'#662c14' //Brown
		]
		this.snakeHeadColors = [
			'#3269c1', //Blue
			'#13a4b5', //Light Blue
			'#24b71b', //Light Green
			'#9b10a8', //Purple
			'#c41717', //Red
			'#562510' //Brown
		]

		//Create food
		this.food = {
			x: 13,
			y: 7,
			color: '#ff6411'
		}

		//Score
		this.score = 0;
		this.scoreMult = 2;
		this.randColor = Math.random() * this.snakeColors.length | 0;

		this.isPaused = false;
		this.gameOver = false;
		this.speed = 0;
		this.moveTimer = 0;
		this.moveInterval = 85;
		this.lastTime = 0;

		this.updateScore();
		this.setDifficulty(1);
		this.update();
	}

	//Draw everything
	draw() 
	{
		const canvas = this.canvas;
		const context = this.context;
		const snake = this.snake;
		const food = this.food;

		context.fillStyle = '#282833';
		context.fillRect(0, 0, canvas.width, canvas.height);

		//Draw Snake
		for (let i = 0; i < snake.length; i++) {
			context.fillStyle = (i==0) ? this.snakeHeadColors[this.randColor] : this.snakeColors[this.randColor];
			context.fillRect(snake[i].x,snake[i].y, 1, 1);
		}

		//Draw Food
		context.fillStyle = food.color;
		context.fillRect(food.x, food.y, 1, 1);
	}

	//Restart
	restart() 
	{
		this.score = 0;
		this.d = null;
		this.slowD =null;
		this.updateScore();

		this.randColor = Math.random() * this.snakeColors.length | 0;

		//Create snake
		this.snake = [{
			x: 4,
			y: 7
		},{
			x: 3,
			y: 7
		}];

		//Create food
		this.food = {
			x: 13,
			y: 7,
			color: '#ff6411'
		}
		this.draw();
		this.gameOver = false;
	}

	//Move snake
	moveSnake() 
	{
		const food = this.food;
		const board = this.board;

		//Old Head
		let snakeX = this.snake[0].x;
		let snakeY = this.snake[0].y;

		switch (this.d) {
			case "LEFT": { 
				snakeX-=1; 
				this.slowD = "LEFT";
				break; 
			}
			case "RIGHT": { 
				snakeX+=1; 
				this.slowD = "RIGHT";
				break; 
			}
			case "UP": { 
				snakeY-=1; 
				this.slowD = "UP";
				break; 
			}
			case "DOWN": { 
				snakeY+=1; 
				this.slowD = "DOWN";
				break; 
			}
		}

		//Check for food
		if (snakeX == food.x && snakeY == food.y) {
			//Create food
			this.score+=this.scoreMult;
			this.updateScore();

			let randX = Math.random()*board.w | 0; let randY = Math.random()*board.h | 0; let loop = true;

			for (let t = 0; t < board.w*board.h; t++) {
				if (loop) {
					console.log(t);
					if (!this.collision({x: randX, y: randY}, this.snake)) {
						this.food = {
							x: randX,
							y: randY,
							color: '#ff5900'
						};
						loop = false;
					} else {
						randX = Math.random()*board.w | 0;
						randY = Math.random()*board.h | 0;
					}	
				}		
			}


		} else {
			//Remove tail
			this.snake.pop();
		}

		let newHead = { x: snakeX, y: snakeY };

		//Check for tail collision
		if (snakeX < 0 || snakeX > board.w-1 || snakeY > board.h-1
			|| snakeY < 0 || this.collision(newHead, this.snake)) {
				this.gameOver = true;
		} else {
			//Add new head
			this.snake.unshift(newHead);
		}
	}

	//Collision
	collision(head, array) 
	{
		for (let i = 0; i < array.length; i++) {
			if (head.x == array[i].x && head.y == array[i].y) {
				return true;
			}
		}
		return false;
	}

	//Update score & Highscore
	updateScore() 
	{
		document.getElementById('score').innerText = this.score;
		document.getElementById('highscore').innerText = this.saveHighScore();
	}
	//Save highscore
	saveHighScore() 
	{
		var highscore = localStorage.getItem("highscore_snake");

		if (highscore !== null) { //If highscore exists
		    if (this.score > highscore) { //If score is larger than highscore
		        localStorage.setItem("highscore_snake", this.score); //Save score
		        return this.score; //Return score
		    } else return localStorage.getItem("highscore_snake"); //Return stored score if score is smaller than highscore
		}
		else{ //Create highscore with current score if it doesnt exist
		    localStorage.setItem("highscore_snake", this.score);
		    return this.score;
		}
	}

	//Game loop
	update(time = 0) 
	{
		const deltaTime = time - this.lastTime;
		this.lastTime = time;

		if (!this.isPaused) {
			this.moveInterval = this.speed;
			this.moveTimer += deltaTime;
			if (this.moveTimer > this.moveInterval) {
				if (!this.gameOver) {
					if (this.d != null) this.moveSnake();
					this.moveTimer = 0;
				} else this.restart();
			}
			this.draw();
		}
		requestAnimationFrame(this.update.bind(this));
	}

	//Set difficulty
	setDifficulty(diff) 
	{
		const diffText = document.getElementById('difficulty');
		if (this.d == null) {
			switch(diff) {
				case 0: {
					this.speed = 100; //Speed
					this.scoreMult = 1; //Score
					diffText.innerText = "Easy";
					break;
				}
				case 1: {
					this.speed = 75; //Speed
					this.scoreMult = 2; //Score
					diffText.innerText = "Normal";
					break;
				}
				case 2: {
					this.speed = 45; //Speed
					this.scoreMult = 4; //Score
					diffText.innerText = "Hard";
					break;
				}
			}
		}
	}
}

window["game"] = new Snake();

//Toggle pause
function togglePause(pause) {
	if (pause != null) {
		window["game"].isPaused = pause;
	} else {
		window["game"].isPaused = !window["game"].isPaused;
	} 
}

//Input
document.addEventListener('keydown', event => {
	const game = window["game"];
	if (!game.isPaused || event.keyCode == 27) {
		const d = game.d;
		const slowD = game.slowD;
		switch (event.keyCode) {
			case 37: { //Left Arrow
				if (d != "RIGHT" && slowD != "RIGHT") game.d = "LEFT";
				event.preventDefault();
				break;
			}
			case 38: { //Up Arrow
				if (d != "DOWN" && slowD != "DOWN") game.d = "UP";
				event.preventDefault();
				break;
			}
			case 39: { //Right Arrow
				if (d != "LEFT" && slowD != "LEFT") game.d = "RIGHT";
				event.preventDefault();
				break;
			}
			case 40: { //Down Arrow
				if (d != "UP" && slowD != "UP") game.d = "DOWN";
				event.preventDefault();
				break;
			}
			case 27: { //Escape
				//Send a message to toggle pause to the parent (website with iframe) if there is one
				if (parent) parent.postMessage("togglePause-snake", "*"); else
				game.togglePause(); //Toggle Pause
				break;
			}
			case 49: { //1
				game.setDifficulty(0);
				break;
			}
			case 50: { //2
				game.setDifficulty(1);
				break;
			}
			case 51: { //3
				game.setDifficulty(2);
				break;
			}
		}
	}
});