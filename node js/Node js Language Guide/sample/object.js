var car = {
    name: "sonata",
    ph: "500ph",
    start: function() {
        console.log("egine is starting");
    },
    stop: function() {
        console.log("egine is stoped");
    },
};

console.log(car);
console.log(car.name);
console.log(car.ph);
car.start();
car.stop();