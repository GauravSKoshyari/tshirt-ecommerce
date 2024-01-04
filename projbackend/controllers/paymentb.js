var braintree = require("braintree");

// everything is from braintree docs 

// signup to braintree sandbox - https://sandbox.braintreegateway.com/login
var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "dhr583zkprvdk9hx",
  publicKey: "446443fw9k9rz2fd",
  privateKey: "82db9cc57d34b849bcb5f8fd9e08959e"
});

exports.getToken = (req, res) => {
  gateway.clientToken.generate({}, function (err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(response);
    }
  });
};

exports.processPayment = (req, res) => {
  let nonceFromTheClient = req.body.paymentMethodNonce;

  let amountFromTheClient = req.body.amount;
  gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,

      options: {
        submitForSettlement: true
      }
    },
    function (err, result) {
      if (err) {
        res.status(500).json(error);
      } else {
        res.json(result);
      }
    }
  );
};
