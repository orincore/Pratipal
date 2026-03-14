// Debug script to test products API
const fetch = require('node-fetch');

async function testProductsAPI() {
  try {
    console.log('Testing products API...');
    
    // Test local API
    const localUrl = 'http://localhost:3000/api/products?limit=100';
    console.log('Fetching from:', localUrl);
    
    const response = await fetch(localUrl);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Products count:', data.products?.length || 0);
    
    if (data.products && data.products.length > 0) {
      console.log('Sample product:', JSON.stringify(data.products[0], null, 2));
      
      // Check for featured products
      const featuredProducts = data.products.filter(p => p.homepage_section === 'featured');
      console.log('Featured products count:', featuredProducts.length);
      
      if (featuredProducts.length > 0) {
        console.log('Featured products:', featuredProducts.map(p => ({ name: p.name, homepage_section: p.homepage_section })));
      }
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testProductsAPI();