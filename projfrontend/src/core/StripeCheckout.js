import React, { useState, useEffect } from "react";
import { isAutheticated } from "../auth/helper";
import { cartEmpty, loadCart } from "./helper/cartHelper";
import { Link } from "react-router-dom";
import StripeCheckoutButton from "react-stripe-checkout"
import { API } from "../backend";
import { createOrder } from "./helper/orderHelper";

const StripeCheckout = ({
    products,
    setReload = f => f,
    reload = undefined
}) => {
    const [data, setData] = useState({
        loading: false,
        success: false,
        error: "",
        address: ""
    });

    const token = isAutheticated() && isAutheticated().token;
    const userId = isAutheticated() && isAutheticated().user._id;

    const getFinalAmount = () => {
        let amount = 0;
        products.map(p => {
            amount = amount + p.price;
        });
        return amount;
    };

    const makePayment = token => {
        // this token is generated with the help of stripeKey(check StripeCheckoutButton below)
        const body = {
            token,
            products
        };
        const headers = {
            "Content-Type": "application/json"
        };
        return fetch(`${API}/stripepayment`, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        })
            .then(response => {
                console.log(response);
                //call further methods
                const { status } = response
                console.log(("STATUS", status));
                // check console and stripe website(logs) to check whether payment is succcessful or not 


            })
            .catch(error => console.log(error));
    };

    const showStripeButton = () => {
        return isAutheticated() ? (
            // publishable key is used in frontend , while secret key is used in backend 
            // u can get PK & SK from here - https://dashboard.stripe.com/test/apikeys
            // u can also create roll key(click on 3 dots ) for each PK & SK  and u can set expiry date for them 
            // we have used roll keys for PK & SK

            // u can use 4242 4242 4242 4242 as account no - check docs for more 
            // enter country - usa

            // todos: getting error while doing payment  -can check devsnest video/ code

            <StripeCheckoutButton stripeKey="pk_test_gdxsWBO06vOm6TiYnHSiZkHK005HS7A36f" token={makePayment} amount={getFinalAmount() * 100} name="Buy Tshirts" shippingAddress billingAddress>
                {/* //name will come at top of popup */}
                {/* *100 is important , otherwise if you want to pay let $90 , u will only pay $.9 */}
                <button className="btn btn-success">Pay with stripe</button>
            </StripeCheckoutButton>
        ) : (
            <Link to="/signin">
                <button className="btn btn-warning">Signin</button>
            </Link>
        );
    };

    return (
        <div>
            <h3 className="text-white">Stripe Checkout ${getFinalAmount()}</h3>
            {showStripeButton()}
        </div>
    );
};

export default StripeCheckout;
