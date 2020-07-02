var cars = ["BMW", "Volvo", "Saab", "Ford", "Fiat", "Audi"];
var text = "";
var i;
for (i = 0; i < cars.length; i++) {	
    console.log(cars[i]);
	text += cars[i];
}

//es6
cars.map((car) => {
    console.log(car);
})