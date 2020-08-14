"use strict";

async function getData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ОШИБКА ПО АДРЕСУ. НЕКОРРЕКТНЫЙ АДРЕС: ${url}, 
     СТАТУС ОШИБКИ ${response.status}`);
  }

  return await response.json();
}

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
const cardsRestaurants = document.querySelector(".cards-restaurants");
const containerPromo = document.querySelector(".container-promo");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const cardsMenu = document.querySelector(".cards-menu");
const restaurantTitle = document.querySelector(".restaurant-title");
const ratingTitle = document.querySelector(".rating");
const minPriceTitle = document.querySelector(".price");
const categoryTitle = document.querySelector(".category");
const list = document.querySelector(".modal-body");
const listPriceTag = document.querySelector(".modal-pricetag");
const buttonClearCart = document.querySelector(".clear-cart");

const cart = [];

let login = localStorage.getItem("deliveryData");

const loadCart = () => {
  if (localStorage.getItem(login)) {
    JSON.parse(localStorage.getItem(login)).forEach((item) => cart.push(item));
  }
};

const saveCart = () => {
  localStorage.setItem(login, JSON.stringify(cart));
};

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth() {
  modalAuth.classList.toggle("is-open");
  loginInput.style.border = "1px solid gray";
}

function fromMain() {
  containerPromo.classList.add("hide");
  restaurants.classList.add("hide");
  menu.classList.remove("hide");
}

function toMain() {
  containerPromo.classList.remove("hide");
  restaurants.classList.remove("hide");
  menu.classList.add("hide");
}

function auth() {
  function logOut() {
    login = null;
    cart.length = 0;
    localStorage.removeItem("deliveryData");
    buttonAuth.style.display = "";
    userName.style.display = "";
    buttonOut.style.display = "";
    cartButton.style.display = "none";

    buttonOut.removeEventListener("click", logOut);
    checkAuth();
    toMain();
  }
  userName.textContent = login;
  buttonAuth.style.display = "none";
  userName.style.display = "inline";
  buttonOut.style.display = "flex";
  cartButton.style.display = "flex";
  buttonOut.addEventListener("click", logOut);
  loadCart();
}

function notAuth() {
  function logIn(e) {
    e.preventDefault();
    login = loginInput.value;

    if (!loginInput.value) {
      loginInput.style.borderColor = "red";
      loginInput.style.transition = "0.6s";
      return false;
    } else {
      localStorage.setItem("deliveryData", login);
      buttonAuth.removeEventListener("click", toggleModalAuth);
      closeAuth.removeEventListener("click", toggleModalAuth);
      logInForm.removeEventListener("submit", logIn);
      toggleModalAuth();
      logInForm.reset();
      checkAuth();
    }
  }

  buttonAuth.addEventListener("click", toggleModalAuth);
  closeAuth.addEventListener("click", toggleModalAuth);
  logInForm.addEventListener("submit", logIn);
}

function checkAuth() {
  if (login) {
    auth();
  } else {
    notAuth();
  }
}

function createCardRestaurants({
  image,
  kitchen,
  name,
  price,
  stars,
  products,
  time_of_delivery: timeOfDelivery,
}) {
  const card = `
<a class="card card-restaurant" data-items = "${products}" data-title = "${[
    name,
    stars,
    price,
    kitchen,
  ]}">
<img src="${image}" alt="image" class="card-image"/>
<div class="card-text">
  <div class="card-heading">
    <h3 class="card-title">${name}</h3>
    <span class="card-tag tag">${timeOfDelivery} мин</span>
  </div>
  <div class="card-info">
    <div class="rating">
      ${stars}
    </div>
    <div class="price">${price}</div>
    <div class="category">${kitchen}</div>
  </div>
  </div>
  </a>`;

  cardsRestaurants.insertAdjacentHTML("beforeend", card);
}

function createCardGood({ description, id, image, name, price }) {
  const card = document.createElement("div");
  card.className = "card wow fadeInUp";
  card.insertAdjacentHTML(
    "beforeend",
    `
    <img src="${image}" alt="image"
							class="card-image" />
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">${name}
								</h3>
							</div>
							<div class="card-info">
								<div class="ingredients">${description}.
								</div>
							</div>
							<div class="card-buttons">
								<button class="button button-primary button-add-cart" id=${id}>
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price card-price-bold">${price} ₽</strong>
							</div>
            </div>
            `
  );

  cardsMenu.insertAdjacentElement("beforeend", card);
}

function openGoods(e) {
  const target = e.target;

  if (!login) {
    toggleModalAuth();
  } else {
    const restaurant = target.closest(".card-restaurant");
    if (restaurant) {
      const info = restaurant.dataset.title;
      const [name, stars, price, kitchen] = info.split(",");
      cardsMenu.textContent = "";
      fromMain();

      restaurantTitle.textContent = name;
      categoryTitle.textContent = kitchen;
      minPriceTitle.textContent = `От ${price} Р`;
      ratingTitle.textContent = stars;

      getData(`./db/${restaurant.dataset.items}`).then((data) => {
        data.forEach(createCardGood);
      });
    }
  }
}

function addToCart(e) {
  const target = e.target;

  const buttonAddToCart = target.closest(".button-add-cart");

  if (buttonAddToCart) {
    const card = target.closest(".card");
    const title = card.querySelector(".card-title-reg").textContent;
    const cost = card.querySelector(".card-price").textContent;
    const id = buttonAddToCart.id;

    const food = cart.find((item) => {
      return item.id === id;
    });

    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1,
      });
    }
  }
  saveCart();
}

function renderCart() {
  list.textContent = "";

  cart.forEach(({ id, title, cost, count }) => {
    const itemCart = `
     <div class="food-row">
					<span class="food-name">${title}</span>
					<strong class="food-price">${cost}</strong>
					<div class="food-counter">
						<button class="counter-button minus" data-id ="${id}">-</button>
						<span class="counter">${count}</span>
						<button class="counter-button plus" data-id ="${id}">+</button>
               </div>`;

    list.insertAdjacentHTML("afterbegin", itemCart);
  });

  const totalPrice = cart.reduce((result, item) => {
    return result + parseFloat(item.cost) * item.count;
  }, 0);

  listPriceTag.textContent = totalPrice + " Р";
}

function changeCount(e) {
  const target = e.target;

  if (target.classList.contains("counter-button")) {
    const food = cart.find((item) => {
      return item.id === target.dataset.id;
    });

    if (target.classList.contains("minus")) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(cart), 1);
      }
    }
    if (target.classList.contains("plus")) food.count++;
    renderCart();
  }
  saveCart();
}

function initial() {
  getData("./db/partners.json").then((data) => {
    data.forEach(createCardRestaurants);
  });

  cartButton.addEventListener("click", function () {
    renderCart();
    toggleModal();
  });

  buttonClearCart.addEventListener("click", function () {
    cart.length = 0;
    renderCart();
  });

  cardsMenu.addEventListener("click", addToCart);

  list.addEventListener("click", changeCount);

  close.addEventListener("click", toggleModal);

  cardsRestaurants.addEventListener("click", openGoods);

  logo.addEventListener("click", function () {
    containerPromo.classList.remove("hide");
    restaurants.classList.remove("hide");
    menu.classList.add("hide");
  });
  new Swiper(".swiper-container", {
    loop: true,
    autoplay: true,
  });
  checkAuth();
}

initial();
new WOW().init();
