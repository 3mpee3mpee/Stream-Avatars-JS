const socket = io();

//Socket Initialization
socket.on("connect", () => {
	console.log("Connected to server");
});

socket.on("emotes", (urls) => {
	for (const url of urls) {
		setTimeout(fireworks(url), 100);
	}
});

function randomNumbers(...args) {
	return (args[0] + args[1]) * args[2];
}

function fireworks(url) {
	// source display
	const widthDisplay = window.innerWidth;
	const heightDisplay = window.innerHeight;

	for (let index = 0; index < 50; index++) {
		// mini display
		const widthDisplayRandom = randomNumbers(
			Math.random() - 1,
			Math.random(),
			widthDisplay
		);
		const heightDisplayRandom = randomNumbers(
			Math.random() - 1,
			Math.random(),
			heightDisplay
		);

		const firework = document.createElement("firework");

		const widthFirework = Math.floor(Math.random() * 40) + 16;
		const heightFirework = widthFirework;

		const destinationXFirework = randomNumbers(Math.random(), -0.5, 800);
		const destinationYFirework = randomNumbers(Math.random(), -0.5, 800);
		const rotation = Math.random() * 500 + 720;
		const delay = Math.random() * 500;

		// firework style
		firework.style.width = `${widthFirework}px`;
		firework.style.height = `${heightFirework}px`;
		firework.style.background = `url(${url})`;
		firework.style.position = "absolute";
		firework.style.backgroundRepeat = "no-repeat";

		const animation = firework.animate(
			[
				{
					transform: `translate(-50%, -50%) translate(${widthDisplayRandom}px, ${heightDisplayRandom}px) rotate(0deg)`,
					opacity: 1,
				},
				{
					transform: `translate(-50%, -50%) translate(${
						widthDisplayRandom + destinationXFirework
					}px, ${
						heightDisplayRandom + destinationYFirework
					}px) rotate(${rotation}deg)`,
					opacity: 0,
				},
			],
			{
				duration: Math.random() * 3000 + 8000,
				delay,
				easing: "ease",
			}
		);

		animation.onfinish = (e) => {
			e.target.effect.target.remove();
		};

		document.body.appendChild(firework);
	}
}

//Canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = document.documentElement.clientWidth;
canvas.height = 300;
let frames = 0;

//Message Model
class Message {
	constructor(username, message, x, y) {
		this.username = username;
		this.message = message;
		this.x = x;
		this.y = y - 20;
		this.display = true;
	}

	displayMessage() {
		if (this.display) {
			this.update();
			ctx.font = "30px Arial";
			ctx.fillStyle = "black";
			ctx.fillText(this.message, this.x, this.y, 300, 150);
			setTimeout(() => {
				this.display = false;
				messages = messages.filter(
					(mess) => mess.message !== this.message
				);
			}, 3000);
		}
	}

	update() {
		const user = users.find((x) => x.username == this.username);
		const dx = this.x - user.x;

		if (Math.round(user.x) != Math.round(this.x)) {
			this.x -= dx / 30;
		}
	}
}

//Player Model
class Player {
	constructor(username) {
		this.username = username;
		this.message = "";
		this.x = canvas.width;
		this.y =
			this.model == "naruto" ? canvas.height / 2 + 20 : canvas.height / 2;
		this.radius = 50;
		this.angle = 0;
		this.frameX = 0;
		this.frameY = 0;
		this.frame = 0;
		this.spriteWidth = 200;
		this.spriteHeight = 150;
		this.walk = false;
		this.random = {
			x: canvas.width / 2,
			y: canvas.height / 2,
		};
		this.image = new Image(200, 300);
		this.state = 0;
		this.model = "naruto";
		this.saying = false;
	}

	changeModel(modelName) {
		this.model = modelName;
	}

	say(mess) {
		this.saying = true;
		if (this.saying) {
			this.message = mess;
			const messageInstance = new Message(
				this.username,
				mess,
				this.x,
				this.y
			);
			messages.push(messageInstance);
			delete messageInstance.instance;
			this.message = "";
			this.saying = false;
		}
	}

	randomWalk() {
		const random = Math.round(Math.random() * 10) * 300;
		if (!this.walk && frames % random == 0) {
			this.random.x = Math.floor(Math.random() * canvas.width);
		}
	}

	stop() {
		this.random.x = this.random.x > this.x ? this.x + 5 : this.x - 5;
	}

	animation() {
		if (this.walk && this.state < 3 && frames % 30 == 0) {
			switch (this.state) {
				case 0:
					this.random.x < this.x
						? (this.image.src = `./assets/${this.model}/left_moving_start.png`)
						: (this.image.src = `./assets/${this.model}/right_moving_start.png`);
					this.state++;
					break;
				case 1:
					this.random.x < this.x
						? (this.image.src = `./assets/${this.model}/left_moving_proceed.png`)
						: (this.image.src = `./assets/${this.model}/right_moving_proceed.png`);
					this.state++;
					break;
				case 2:
					this.random.x < this.x
						? (this.image.src = `./assets/${this.model}/left_moving_finish.png`)
						: (this.image.src = `./assets/${this.model}/right_moving_finish.png`);
					this.state = 0;
					break;
			}
		}
	}

	update() {
		const dx = this.x - this.random.x;

		if (Math.round(this.random.x) != Math.round(this.x)) {
			this.x -= dx / 30;
			this.walk = true;
			this.animation();
		} else {
			this.image.src = `./assets/${this.model}/idle.png`;
			this.walk = false;
			this.randomWalk();
		}
	}

	draw() {
		ctx.drawImage(
			this.image,
			this.frameX * this.spriteWidth,
			this.frameY * this.spriteHeight,
			this.spriteWidth,
			this.spriteHeight,
			this.x,
			this.y,
			this.spriteWidth / 1,
			this.spriteHeight / 1
		);
	}
}

//Listeting to Socket Events

const users = [];
let messages = [];

socket.on("message", (data) => {
	const [username, message] = data;
	const user = users.find((x) => x.username === username);
	if (user) {
		user.say(message);
	} else {
		const player = new Player(username);
		users.push(player);
	}
});

socket.on("change", (data) => {
	const [username, model] = data;

	const user = users.find((user) => user.username === username);

	if (user) {
		user.changeModel(model);
	} else {
		const player = new Player(username, null);
		player.changeModel(model);
		users.push(player);
	}
});

//Update Loop
function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	users.forEach((player) => {
		player.update();
		player.draw();
	});
	messages.forEach((mess) => {
		mess.displayMessage();
	});
	frames++;
	requestAnimationFrame(animate);
}

animate();
