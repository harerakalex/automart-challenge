const orders = [];

const order1 = {
	"id": 1,
    "buyer": 2,
    "car_id": 3,
    "created_on": "2019-5-23 10:17:33",
    "price": 1700,
    "price_offered": "1600",
    "status": "pending"
};

const order2 = {
	"id": 2,
    "buyer": 1,
    "car_id": 2,
    "created_on": "2019-5-23 11:38:16",
    "price": 1400,
    "price_offered": 1100,
    "status": "pending"
};

orders.push(order1,order2);
export default orders;