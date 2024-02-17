import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';
import { revalidate } from '../revalidate-target';

export const GET_FEATURED_PRODUCTS_QUERY = /* GraphQL */ `
  query getFeaturedProducts($first: Int) {
    site {
      featuredProducts(first: $first) {
        edges {
          node {
            ...ProductDetails
          }
        }
      }
    }
  }
`;

interface Options {
  first?: number;
}

export const getFeaturedProducts = cache(async ({ first = 12 }: Options = {}) => {
  const query = graphql(GET_FEATURED_PRODUCTS_QUERY);
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: query,
    variables: { first },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const { site } = response.data;

  return removeEdgesAndNodes(site.featuredProducts).map((featuredProduct) => ({
    ...featuredProduct,
    productOptions: removeEdgesAndNodes(featuredProduct.productOptions),
  }));
});
