import connectDB from "./mongodb";
import AuthUser from "@/models/AuthUser";
import Customer from "@/models/Customer";
import CustomerAddress from "@/models/CustomerAddress";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import CartItem from "@/models/CartItem";
import LandingPage from "@/models/LandingPage";
import Media from "@/models/Media";
import InvitationRequest from "@/models/InvitationRequest";
import HeroSection from "@/models/HeroSection";
import ShippingSettings from "@/models/ShippingSettings";
import SessionBooking from "@/models/SessionBooking";
import Service from "@/models/Service";
import Course from "@/models/Course";

export async function getDB() {
  await connectDB();
  return {
    AuthUser,
    Customer,
    CustomerAddress,
    Product,
    Category,
    Order,
    OrderItem,
    CartItem,
    LandingPage,
    Media,
    InvitationRequest,
    HeroSection,
    ShippingSettings,
    SessionBooking,
    Service,
    Course,
  };
}

export default getDB;
