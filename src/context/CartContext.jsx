import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        // Tenta recuperar do localStorage ao iniciar
        const savedCart = localStorage.getItem('karaoke_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        // Salva no localStorage sempre que o carrinho mudar
        localStorage.setItem('karaoke_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            // Evita duplicatas (se a música já estiver no carrinho, não adiciona de novo)
            const isAlreadyInCart = prevCart.some(item => item.id === product.id);
            if (isAlreadyInCart) return prevCart;

            return [...prevCart, product];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const isInCart = (productId) => {
        return cart.some(item => item.id === productId);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price || 0), 0);
    const cartCount = cart.length;

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            isInCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
}
