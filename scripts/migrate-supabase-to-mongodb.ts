/**
 * Data Migration Script: Supabase to MongoDB
 * 
 * This script migrates all data from Supabase PostgreSQL to MongoDB.
 * Run with: npx ts-node scripts/migrate-supabase-to-mongodb.ts
 */

import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY!;
const MONGODB_URI = process.env.MONGODB_URI!;

if (!SUPABASE_URL || !SUPABASE_KEY || !MONGODB_URI) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Import models
import AuthUser from '../src/models/AuthUser.ts';
import Customer from '../src/models/Customer.ts';
import CustomerAddress from '../src/models/CustomerAddress.ts';
import Category from '../src/models/Category.ts';
import Product from '../src/models/Product.ts';
import Order from '../src/models/Order.ts';
import OrderItem from '../src/models/OrderItem.ts';
import CartItem from '../src/models/CartItem.ts';
import LandingPage from '../src/models/LandingPage.ts';
import Media from '../src/models/Media.ts';
import InvitationRequest from '../src/models/InvitationRequest.ts';
import HeroSection from '../src/models/HeroSection.ts';

async function connectMongoDB() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB');
}

async function migrateAuthUsers() {
  console.log('\nMigrating auth_users...');
  const { data, error } = await supabase.from('auth_users').select('*');
  
  if (error) {
    console.error('Error fetching auth_users:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No auth_users to migrate');
    return;
  }

  for (const user of data) {
    await AuthUser.create({
      _id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} auth users`);
}

async function migrateCustomers() {
  console.log('\nMigrating customers...');
  const { data, error } = await supabase.from('customers').select('*');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No customers to migrate');
    return;
  }

  for (const customer of data) {
    await Customer.create({
      _id: customer.id,
      email: customer.email,
      password_hash: customer.password_hash,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
      avatar_url: customer.avatar_url,
      is_verified: customer.is_verified,
      verification_token: customer.verification_token,
      reset_token: customer.reset_token,
      reset_token_expires: customer.reset_token_expires,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} customers`);
}

async function migrateCustomerAddresses() {
  console.log('\nMigrating customer_addresses...');
  const { data, error } = await supabase.from('customer_addresses').select('*');
  
  if (error) {
    console.error('Error fetching customer_addresses:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No customer addresses to migrate');
    return;
  }

  for (const address of data) {
    await CustomerAddress.create({
      _id: address.id,
      customer_id: address.customer_id,
      address_type: address.address_type,
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company,
      address_line1: address.address_line1,
      address_line2: address.address_line2,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone,
      is_default: address.is_default,
      created_at: address.created_at,
      updated_at: address.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} customer addresses`);
}

async function migrateCategories() {
  console.log('\nMigrating categories...');
  const { data, error } = await supabase.from('categories').select('*');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No categories to migrate');
    return;
  }

  for (const category of data) {
    await Category.create({
      _id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image_url,
      parent_id: category.parent_id,
      display_order: category.display_order,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} categories`);
}

async function migrateProducts() {
  console.log('\nMigrating products...');
  const { data, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No products to migrate');
    return;
  }

  for (const product of data) {
    await Product.create({
      _id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description,
      price: product.price,
      sale_price: product.sale_price,
      cost_price: product.cost_price,
      sku: product.sku,
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      manage_stock: product.manage_stock,
      category_id: product.category_id,
      images: product.images,
      featured_image: product.featured_image,
      is_featured: product.is_featured,
      is_active: product.is_active,
      homepage_section: product.homepage_section,
      weight: product.weight,
      dimensions: product.dimensions,
      tags: product.tags,
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      created_at: product.created_at,
      updated_at: product.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} products`);
}

async function migrateOrders() {
  console.log('\nMigrating orders...');
  const { data, error } = await supabase.from('orders').select('*');
  
  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No orders to migrate');
    return;
  }

  for (const order of data) {
    await Order.create({
      _id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping_cost: order.shipping_cost,
      discount: order.discount,
      total: order.total,
      currency: order.currency,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      notes: order.notes,
      tracking_number: order.tracking_number,
      tracking_status: order.tracking_status,
      shipped_at: order.shipped_at,
      completed_at: order.completed_at,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} orders`);
}

async function migrateOrderItems() {
  console.log('\nMigrating order_items...');
  const { data, error } = await supabase.from('order_items').select('*');
  
  if (error) {
    console.error('Error fetching order_items:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No order items to migrate');
    return;
  }

  for (const item of data) {
    await OrderItem.create({
      _id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      variant_name: item.variant_name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      created_at: item.created_at,
    });
  }

  console.log(`✓ Migrated ${data.length} order items`);
}

async function migrateCartItems() {
  console.log('\nMigrating cart_items...');
  const { data, error } = await supabase.from('cart_items').select('*');
  
  if (error) {
    console.error('Error fetching cart_items:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No cart items to migrate');
    return;
  }

  for (const item of data) {
    await CartItem.create({
      _id: item.id,
      customer_id: item.customer_id,
      session_id: item.session_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      created_at: item.created_at,
      updated_at: item.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} cart items`);
}

async function migrateLandingPages() {
  console.log('\nMigrating landing_pages...');
  const { data, error } = await supabase.from('landing_pages').select('*');
  
  if (error) {
    console.error('Error fetching landing_pages:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No landing pages to migrate');
    return;
  }

  for (const page of data) {
    await LandingPage.create({
      _id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      theme: page.theme,
      seo_title: page.seo_title,
      seo_description: page.seo_description,
      status: page.status,
      created_at: page.created_at,
      updated_at: page.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} landing pages`);
}

async function migrateMedia() {
  console.log('\nMigrating media...');
  const { data, error } = await supabase.from('media').select('*');
  
  if (error) {
    console.error('Error fetching media:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No media to migrate');
    return;
  }

  for (const media of data) {
    await Media.create({
      _id: media.id,
      name: media.name,
      url: media.url,
      type: media.type,
      size: media.size,
      uploaded_at: media.uploaded_at,
    });
  }

  console.log(`✓ Migrated ${data.length} media files`);
}

async function migrateInvitationRequests() {
  console.log('\nMigrating invitation_requests...');
  const { data, error } = await supabase.from('invitation_requests').select('*');
  
  if (error) {
    console.error('Error fetching invitation_requests:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No invitation requests to migrate');
    return;
  }

  for (const request of data) {
    await InvitationRequest.create({
      _id: request.id,
      landing_page_id: request.landing_page_id,
      landing_page_slug: request.landing_page_slug,
      first_name: request.first_name,
      email: request.email,
      whatsapp_number: request.whatsapp_number,
      location: request.gender ?? request.location,
      created_at: request.created_at,
    });
  }

  console.log(`✓ Migrated ${data.length} invitation requests`);
}

async function migrateHeroSections() {
  console.log('\nMigrating hero_sections...');
  const { data, error } = await supabase.from('hero_sections').select('*');
  
  if (error) {
    console.error('Error fetching hero_sections:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No hero sections to migrate');
    return;
  }

  for (const section of data) {
    await HeroSection.create({
      _id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      cta_text: section.cta_text,
      cta_link: section.cta_link,
      background_type: section.background_type,
      background_image_url: section.background_image_url,
      background_video_url: section.background_video_url,
      card_type: section.card_type,
      card_image_url: section.card_image_url,
      card_video_url: section.card_video_url,
      display_order: section.display_order,
      is_active: section.is_active,
      created_at: section.created_at,
      updated_at: section.updated_at,
    });
  }

  console.log(`✓ Migrated ${data.length} hero sections`);
}

async function main() {
  try {
    console.log('=== Supabase to MongoDB Migration ===\n');
    
    await connectMongoDB();

    // Clear existing data (optional - comment out if you want to preserve existing data)
    console.log('\nClearing existing MongoDB data...');
    await Promise.all([
      AuthUser.deleteMany({}),
      Customer.deleteMany({}),
      CustomerAddress.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      OrderItem.deleteMany({}),
      CartItem.deleteMany({}),
      LandingPage.deleteMany({}),
      Media.deleteMany({}),
      InvitationRequest.deleteMany({}),
      HeroSection.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    // Migrate data in order (respecting foreign key dependencies)
    await migrateAuthUsers();
    await migrateCustomers();
    await migrateCustomerAddresses();
    await migrateCategories();
    await migrateProducts();
    await migrateOrders();
    await migrateOrderItems();
    await migrateCartItems();
    await migrateLandingPages();
    await migrateMedia();
    await migrateInvitationRequests();
    await migrateHeroSections();

    console.log('\n=== Migration Complete ===');
    console.log('All data has been successfully migrated from Supabase to MongoDB');
    
  } catch (error) {
    console.error('\n=== Migration Failed ===');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

main();
