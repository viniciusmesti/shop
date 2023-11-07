import Stripe from 'stripe';

const stripe = new Stripe('', {
  apiVersion: '2022-11-15',
  timeout: 20000,
});
