import React, { useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Head from "next/head";
import Stripe from "stripe";
import axios from "axios";

import { stripe } from "../../lib/stripe";

import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from "../../styles/pages/product";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    price: string;
    defaultPriceId: string;
  };
}

const Product = ({ product }: ProductProps) => {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);

  const buyProductHandler = async () => {
    // console.log(product.defaultPriceId);
    try {
      setIsCreatingCheckoutSession(true);

      const response = await axios.post("/api/checkout", {
        priceId: product.defaultPriceId,
      });

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl;
    } catch (err) {
      setIsCreatingCheckoutSession(false);

      alert("Falha ao redirecionar ao checkout!");
    }
  };

  return (
    <>
      <Head>
        <title>{`${product.name} | Ignite Shop`}</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>
          <button disabled={isCreatingCheckoutSession} onClick={buyProductHandler}>Comprar</button>
        </ProductDetails>
      </ProductContainer>
    </>
  );
};

export default Product;

export const getStaticPaths: GetStaticPaths = async () => { // SSG com parâmetro dinâmico
  return {
    paths: [
      {
        params: { id: "prod_NsrAqTZzdGril1" }
      }
    ],
    fallback: "blocking"
  };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"]
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(price.unit_amount / 100),
        defaultPriceId: price.id
      }
    },
    revalidate: 60 * 60 * 1
  };
};