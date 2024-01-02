import { API } from "../../backend";

export const signup = user => {
  return fetch(`${API}/signup`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  })
    .then(response => {
      return response.json();
    })
    .catch(err => console.log(err));
};

export const signin = user => {
  return fetch(`${API}/signin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  })
    .then(response => {
      return response.json();
    })
    .catch(err => console.log(err));
};

// res.json({ token, user: { _id, name, email, role } });   this is what we will get after successful signin(check backend code for signin ) and this is passed to below function as 'data' ; we r simply storing 'data' in localStorage . 
export const authenticate = (data, next) => {
  if (typeof window !== "undefined") {  // if window is accessible to us 
    localStorage.setItem("jwt", JSON.stringify(data));
    next();
  }
};

// next - means we will pass a function which can be executed inside it 
export const signout = next => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt");
    next();

    // logout user from backend as well
    return fetch(`${API}/signout`, {
      method: "GET"
    })
      .then(response => console.log("signout success"))
      .catch(err => console.log(err));
  }
};

export const isAutheticated = () => {
  if (typeof window == "undefined") {     // we don't have access to window object 
    return false;
  }
  if (localStorage.getItem("jwt")) {
    return JSON.parse(localStorage.getItem("jwt"));
  } else {
    return false;
  }
};
