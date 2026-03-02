import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const MOCK_CART = [
    { id: 1, title: 'Evidências (Playback)', artist: 'Chitãozinho & Xororó', format: 'MP3 320kbps', price: 14.90, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I' },
    { id: 2, title: 'Bohemian Rhapsody', artist: 'Queen', format: 'WAV Studio Master', price: 19.90, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I' },
];

export default function Cart() {
    const { cart, cartTotal, removeFromCart } = useCart();

    return (
        <div className="flex w-full max-w-[1200px] mx-auto py-8 flex-col px-4 gap-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <Link to="/catalog" className="hover:text-primary transition-colors">Catálogo</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">Carrinho</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Cart Items Phase */}
                <div className="flex-1 flex flex-col gap-6 w-full">
                    <div className="flex items-center justify-between pb-4 border-b border-primary/10">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Seu Carrinho</h1>
                        <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                            {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {cart.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/30 dark:bg-slate-900/30">
                                <span className="material-symbols-outlined text-4xl mb-4 opacity-50">shopping_cart</span>
                                <p className="text-lg">Seu carrinho está vazio.</p>
                                <p className="text-sm mt-1 mb-6">Explore o catálogo para adicionar músicas.</p>
                                <Link to="/catalog" className="flex items-center justify-center rounded-xl bg-primary px-6 h-11 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                                    Explorar Catálogo
                                </Link>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-primary/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm group transition-shadow hover:shadow-md">
                                    <div className="size-20 rounded-lg overflow-hidden shrink-0 shadow-sm">
                                        <img src={item.cover_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I"} alt="Capa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</h3>
                                        <p className="text-sm text-slate-500 truncate">{item.artist}</p>
                                        <span className="inline-flex mt-1 items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">
                                            <span className="material-symbols-outlined text-[10px]">audio_file</span>
                                            {item.format}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <span className="text-lg font-black text-primary">
                                            R$ {Number(item.price).toFixed(2).replace('.', ',')}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                            <span className="hidden sm:inline">Remover</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link to="/catalog" className="flex items-center gap-2 text-primary text-sm font-bold hover:underline w-fit mt-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Continuar Comprando
                    </Link>
                </div>

                {/* Order Summary Phase */}
                <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0 sticky top-24">
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col gap-6 shadow-xl shadow-primary/5">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 border-b border-primary/10 pb-4">Resumo do Pedido</h2>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm">
                                <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm">
                                <span>Descontos</span>
                                <span className="font-medium text-green-500">- R$ 0,00</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm">
                                <span>Taxas</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">R$ 0,00</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-primary/10 flex items-center justify-between">
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total</span>
                            <span className="text-3xl font-black text-primary">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            <label htmlFor="coupon" className="sr-only">Cupom de desconto</label>
                            <div className="flex gap-2 relative">
                                <input
                                    id="coupon"
                                    name="coupon"
                                    type="text"
                                    placeholder="Cupom de desconto"
                                    className="w-full flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                                <button className="rounded-lg bg-slate-200 dark:bg-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                                    Aplicar
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4 border-t border-primary/10">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Métodos de Pagamento</span>
                            <div className="flex gap-2">
                                <div className="flex-1 h-10 rounded border border-primary/20 flex items-center justify-center bg-white dark:bg-slate-900 cursor-pointer hover:border-primary transition-colors hover:shadow-sm">
                                    <span className="material-symbols-outlined text-slate-500">credit_card</span>
                                </div>
                                <div className="flex-1 h-10 rounded border border-primary bg-primary/10 flex items-center justify-center text-primary font-bold cursor-pointer transition-colors shadow-sm">
                                    PIX
                                </div>
                                <div className="flex-1 h-10 rounded border border-primary/20 flex items-center justify-center bg-white dark:bg-slate-900 cursor-pointer hover:border-primary transition-colors hover:shadow-sm">
                                    <span className="material-symbols-outlined text-slate-500">payments</span>
                                </div>
                            </div>
                        </div>

                        <Link to="/checkout" className="flex items-center justify-center w-full h-14 rounded-xl bg-primary text-white font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/30 mt-2 gap-2">
                            Ir para Pagamento
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>

                        <div className="flex items-start gap-2 text-xs text-slate-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 p-3 rounded-lg border border-orange-500/20">
                            <span className="material-symbols-outlined text-base">lock</span>
                            <p>Download liberado imediatamente após a confirmação do pagamento via PIX ou Cartão.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
