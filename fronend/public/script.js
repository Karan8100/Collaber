const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');//get 2d drawing context from the canvas

const thicknessInput = document.getElementById("thickness");
const colorInput = document.getElementById("color");
const bgColorInput = document.getElementById("bg-color");
const eraserBtn = document.getElementById("eraser");
const clearBtn = document.getElementById("clear");

const socket = io();
let userColor = "#" + Math.floor(Math.random() * 16777215).toString(16); // Random color for each user
let userId = Math.random().toString(36).substr(2, 9); // Unique ID for each user

canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;

let drawing = false; //A flag to track when the user is drawing.
let brushSize = 5;
let brushColor = "#000000";
let bgColor = "#ffffff";
let isErase = false;

thicknessInput.addEventListener("input",(e)=>{
    brushSize = e.target.value;
})

colorInput.addEventListener("input",(e)=>{
    brushColor = e.target.value;
    isErase = false; // Disable eraser when color is changed
})

bgColorInput.addEventListener("input", (e) => {
    bgColor = e.target.value;
    canvas.style.background = bgColor;
});

canvas.addEventListener("mousedown",(e)=>{ //When the mouse is pressed, drawing is set to true, so we can start drawing.
    drawing = true;
    draw(e);
});

// ctx.moveTo(100,100);
// ctx.lineTo(200,200);
// ctx.stroke();

canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath(); // Reset the path so new lines don't connect to the previous ones
});

eraserBtn.addEventListener("change", () => {
    if(!isErase){
        isErase = true;
    }else{
        isErase = false;
    }
    
});


// Clear the entire canvas
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clearCanvas"); // Send event to clear for all users
});

 // Receive clear event
 socket.on("clearCanvas", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 });


// Drawing on the Canvas (mousemove event)

canvas.addEventListener("mousemove",(e)=>{
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect(); //to position pointer correctly
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

     ctx.lineWidth = brushSize;
     ctx.lineCap = "round";
     ctx.strokeStyle = isErase? bgColor : brushColor;

     ctx.lineTo(x,y);
     ctx.stroke();
     ctx.beginPath();
     ctx.moveTo(x,y);

      // Send drawing data to other users
    socket.emit("draw", { x, y, brushSize, brushColor:ctx.strokeStyle });

});
 // Send cursor position to others
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socket.emit("cursorMove", { x, y, userId, userColor });
});

// Receive and draw cursor from other users
socket.on("cursorMove", ({ x, y, userId, userColor }) => {
    let cursor = document.getElementById(userId);
    if (!cursor) {
        cursor = document.createElement("div");
        cursor.id = userId;
        cursor.style.position = "absolute";
        cursor.style.width = "10px";
        cursor.style.height = "10px";
        cursor.style.backgroundColor = userColor;
        cursor.style.borderRadius = "50%";
        cursor.style.pointerEvents = "none";
        document.body.appendChild(cursor);
    }
    cursor.style.left = `${x + canvas.offsetLeft}px`;
    cursor.style.top = `${y + canvas.offsetTop}px`;
});

     // Receive drawing from others
    socket.on("draw", ({ x, y, brushSize, brushColor }) => {
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.strokeStyle = brushColor;
    
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    });

   

    



   


