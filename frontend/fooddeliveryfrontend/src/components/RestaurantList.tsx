import ItemList from "@/components/ItemList";
import { Restaurant } from '../types/restaurant';

interface RestaurantListProps {
    restaurants: Restaurant[]; // The array of restaurants
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
    // Log the restaurants prop to the console
    console.log("Restaurants:", restaurants);

    // Fallback if restaurants is undefined or empty
    if (!restaurants || restaurants.length === 0) {
        return <div>No restaurants available.</div>;
    }

    return (
        <div>
            <h2>Restaurants</h2>
            <ul>
                {restaurants.map(restaurant => (
                    <li key={restaurant.id}>
                        <h3>{restaurant.name}</h3>
                        <p>{restaurant.address}</p>
                        <p>{restaurant.phone}</p>
                        <ItemList restaurantId={restaurant.id} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RestaurantList;