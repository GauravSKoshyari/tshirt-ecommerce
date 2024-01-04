import { API } from "../../backend";

export const createOrder = (userId, token, orderData) => {
  return fetch(`${API}/order/create/${userId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ order: orderData })
    // we were using req.body.order in backend
  })
    .then(reponse => {
      return reponse.json();
    })
    .catch(err => console.log(err));
};
