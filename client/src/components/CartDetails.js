import React, { useEffect, useState } from 'react';
import "./cartstyle.css";
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  removeToCart,
  removeSingleIteams,
  emptycartIteam,
} from '../redux/features/cartSlice';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const CartDetails = () => {
  const { carts } = useSelector((state) => state.allCart);
  const [totalprice, setPrice] = useState(0);
  const [totalquantity, setTotalQuantity] = useState(0);

  const dispatch = useDispatch();

  // add to cart
  const handleIncrement = (item) => {
    dispatch(addToCart(item));
  };

  // remove item from cart
  const handleDecrement = (id) => {
    dispatch(removeToCart(id));
    toast.success('Item removed from your cart');
  };

  // remove single quantity
  const handleSingleDecrement = (item) => {
    dispatch(removeSingleIteams(item));
  };

  // empty cart
  const emptycart = () => {
    dispatch(emptycartIteam());
    toast.success('Your cart is now empty');
  };

  // calculate total price
  useEffect(() => {
    const total = carts.reduce((acc, item) => acc + item.price * item.qnty, 0);
    setPrice(total);
  }, [carts]);

  // calculate total quantity
  useEffect(() => {
    const quantity = carts.reduce((acc, item) => acc + item.qnty, 0);
    setTotalQuantity(quantity);
  }, [carts]);

  // Stripe payment
 const makePayment = async () => {
  const stripe = await loadStripe("pk_live_51RQllyJMGO0BOXAgtW6ti7Lk5imxMIu28YqtjZG9RMmYEV3lP398IaqkURK61jJc8avQPvnTQ6SFH8jsj61aKu8R00HgQySsIM"); // ✅ Replace with your real key

  const body = {
    products: carts
  };

  try {
    const response = await fetch("http://localhost:7000/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.log(result.error.message);
    }

  } catch (error) {
    console.error("Stripe payment error:", error.message);
  }
};

  return (
    <div className='row justify-content-center m-0'>
      <div className='col-md-8 mt-5 mb-5 cardsdetails'>
        <div className="card">
          <div className="card-header bg-dark p-3">
            <div className='card-header-flex'>
              <h5 className='text-white m-0'>
                Cart Calculation {carts.length > 0 ? `(${carts.length})` : ""}
              </h5>
              {carts.length > 0 && (
                <button className='btn btn-danger mt-0 btn-sm' onClick={emptycart}>
                  <i className='fa fa-trash-alt mr-2'></i><span>Empty Cart</span>
                </button>
              )}
            </div>
          </div>

          <div className="card-body p-0">
            {carts.length === 0 ? (
              <table className='table cart-table mb-0'>
                <tbody>
                  <tr>
                    <td colSpan={6}>
                      <div className='cart-empty'>
                        <i className='fa fa-shopping-cart'></i>
                        <p>Your Cart Is Empty</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className='table cart-table mb-0 table-responsive-sm'>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Product</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className='text-right'>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <button className='prdct-delete' onClick={() => handleDecrement(item.id)}>
                          <i className='fa fa-trash-alt'></i>
                        </button>
                      </td>
                      <td>
                        <div className='product-img'>
                          <img src={item.imgdata} alt={item.dish} />
                        </div>
                      </td>
                      <td>
                        <div className='product-name'>
                          <p>{item.dish}</p>
                        </div>
                      </td>
                      <td>₹ {item.price}</td>
                      <td>
                        <div className="prdct-qty-container">
                          <button
                            className='prdct-qty-btn'
                            type='button'
                            onClick={
                              item.qnty <= 1
                                ? () => handleDecrement(item.id)
                                : () => handleSingleDecrement(item)
                            }
                          >
                            <i className='fa fa-minus'></i>
                          </button>
                          <input
                            type="text"
                            className='qty-input-box'
                            value={item.qnty}
                            disabled
                          />
                          <button className='prdct-qty-btn' type='button' onClick={() => handleIncrement(item)}>
                            <i className='fa fa-plus'></i>
                          </button>
                        </div>
                      </td>
                      <td className='text-right'>₹ {item.qnty * item.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3}></th>
                    <th>Items: <span className='text-danger'>{totalquantity}</span></th>
                    <th className='text-right'>Total: <span className='text-danger'>₹ {totalprice}</span></th>
                    <th className='text-right'>
                      <button className='btn btn-success' onClick={makePayment}>Checkout</button>
                    </th>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDetails;
