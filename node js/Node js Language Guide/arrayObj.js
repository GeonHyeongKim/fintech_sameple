var cars01 = []
var car01 = {
    name: "sonata",
    ph: "500ph",
    start: function() {
        console.log("egine is starting");
    },
    stop: function() {
        console.log("egine is stoped");
    },
}

var car02 = {
    name: "BMW",
    ph: "600ph",
    start: function() {
        console.log("egine is starting");
    },
    stop: function() {
        console.log("egine is stoped");
    },
}

console.log(car01);
console.log(car02);

cars01[0] = car01;
cars01[1] = car02;

console.log(cars01[1].name);