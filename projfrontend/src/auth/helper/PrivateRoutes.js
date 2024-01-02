import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAutheticated } from "./index";

// Protects specific routes within a React application, ensuring that only authenticated users can access them.

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props =>
        isAutheticated() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: props.location }
              // Preserves the intended destination in the state object for later redirection after successful login.
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
