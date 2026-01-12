import { TbTruckDelivery, TbDiscount2 } from "react-icons/tb";
import { RiRefund2Fill } from "react-icons/ri";
import { MdSupportAgent } from "react-icons/md";
import { FC } from "react";
import FeatureCard from "./FeatureCard";

const data = [
  {
    icon: <TbTruckDelivery className="text-4xl dark:text-white" />,
    title: "Ücretsiz Teslimat", // Free Delivery 
    desc: "Tüm ürünlerden gelen siparişler", //Orders from all items 
  },
  {
    icon: <RiRefund2Fill className="text-4xl dark:text-white" />,
    title: "Para iadesi",  // Return & Refund 
    desc: "Para iade garantisi", // Money back guarantee
  },
  {
    icon: <TbDiscount2 className="text-4xl dark:text-white" />,
    title: "Üye indirimleri ", // Member Discount 
     desc: " ", //  On order over $99
  },
  {
    icon: <MdSupportAgent className="text-4xl dark:text-white" />,
    title: "7/24 Destek",   //Support 24/7 
    desc: "Bize günün 24 saati ulaşın",  //Contact us 24 hours a day 
  },
];

const Features: FC = () => (
  <div className="px-4 container grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mt-8 mx-auto">
    {data.map((item) => (
      <FeatureCard
        key={item.title}
        icon={item.icon}
        title={item.title}
        desc={item.desc}
      />
    ))}
  </div>
);

export default Features;
