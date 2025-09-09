import React, { useState } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { Product, ProductVariant } from '../../../../types/index';
import { Plus, UploadCloud, Search, Box, Tag as TagIcon, Trash2, CheckCircle } from '../../../ui/Icons';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Label from '../../../ui/Label';
import Textarea from '../../../ui/Textarea';

const MOCK_PRODUCTS: Product[] = [
    {
        id: 'prod-1', name: 'Café Blend Premium', description: 'Nuestro blend exclusivo de granos arábicos, tostado a la perfección.',
        price: 15.50, category: 'Bebidas', sku: 'CAFE-001', stock: 120,
        images: ['https://picsum.photos/seed/coffee1/400'],
        variants: [
            { id: 'var-1-1', name: 'Tamaño', value: '250g', stock: 70 },
            { id: 'var-1-2', name: 'Tamaño', value: '500g', stock: 50 },
        ]
    },
    {
        id: 'prod-2', name: 'Croissant de Almendras', description: 'Hojaldre mantecoso relleno de crema de almendras y cubierto con almendras fileteadas.',
        price: 3.75, category: 'Panadería', sku: 'CROI-002', stock: 45,
        images: ['https://picsum.photos/seed/croissant/400'],
        variants: []
    },
    {
        id: 'prod-3', name: 'Taza de Cerámica', description: 'Taza de cerámica artesanal con el logo de Orbit.',
        price: 25.00, category: 'Merchandising', sku: 'MERCH-001', stock: 30,
        images: ['https://picsum.photos/seed/mug/400'],
        variants: [
            { id: 'var-3-1', name: 'Color', value: 'Blanco', stock: 15 },
            { id: 'var-3-2', name: 'Color', value: 'Negro', stock: 15 },
        ]
    }
];

const ProductCatalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id || null);

    const selectedProduct = products.find(p => p.id === selectedProductId);

    const handleAddProduct = () => {
        const newProduct: Product = {
            id: `prod-${Date.now()}`, name: 'Nuevo Producto', description: '', price: 0, category: '',
            sku: '', stock: 0, images: [], variants: []
        };
        setProducts(prev => [newProduct, ...prev]);
        setSelectedProductId(newProduct.id);
    };

    const handleUpdateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    return (
        <div className="flex h-full">
            {/* Product List */}
            <div className="w-1/3 border-r dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold">Productos ({products.length})</h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary"><UploadCloud className="w-4 h-4 mr-1"/> Importar</Button>
                        <Button size="sm" onClick={handleAddProduct}><Plus className="w-4 h-4 mr-1"/> Añadir</Button>
                    </div>
                </div>
                <div className="p-4"><Input placeholder="Buscar producto..." className="pl-8" /><Search className="absolute left-7 top-7 w-4 h-4 text-gray-400"/></div>
                <div className="flex-1 overflow-y-auto">
                    {products.map(p => (
                        <ProductListItem key={p.id} product={p} isActive={p.id === selectedProductId} onClick={() => setSelectedProductId(p.id)} />
                    ))}
                </div>
            </div>
            {/* Product Editor */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                {selectedProduct ? (
                    <ProductEditor product={selectedProduct} onUpdate={handleUpdateProduct} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Selecciona un producto o añade uno nuevo.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-components ---

const ProductListItem: React.FC<{product: Product, isActive: boolean, onClick: () => void}> = ({ product, isActive, onClick }) => (
    <div onClick={onClick} className={`p-3 mx-2 my-1 rounded-lg flex items-center gap-3 cursor-pointer ${isActive ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
        <img src={product.images[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-12 h-12 rounded-md object-cover bg-gray-200" />
        <div className="flex-1 overflow-hidden">
            <p className="font-medium text-sm truncate">{product.name}</p>
            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
        </div>
        <p className="font-semibold text-sm">${product.price.toFixed(2)}</p>
    </div>
);

const ProductEditor: React.FC<{ product: Product, onUpdate: (product: Product) => void }> = ({ product, onUpdate }) => {
    const [formData, setFormData] = useState<Product>(product);

    // Update local form state when the selected product changes
    React.useEffect(() => {
        setFormData(product);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const valueToSet = e.target.type === 'number' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: valueToSet }));
    };
    
    // Simple debounced update
    React.useEffect(() => {
        const handler = setTimeout(() => {
            onUpdate(formData);
        }, 500);
        return () => clearTimeout(handler);
    }, [formData, onUpdate]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold">{formData.name}</h2>
                 <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4"/> Sincronizado en WhatsApp
                 </div>
            </div>
            
            <EditorSection title="Información Básica">
                <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="name">Nombre</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} /></div>
                    <div><Label htmlFor="category">Categoría</Label><Input id="category" name="category" value={formData.category} onChange={handleChange} /></div>
                </div>
                 <div><Label htmlFor="description">Descripción</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3}/></div>
            </EditorSection>

            <EditorSection title="Imágenes">
                <div className="grid grid-cols-4 gap-3">
                    {formData.images.map(img => <img key={img} src={img} className="w-full h-24 object-cover rounded-md" />)}
                    <div className="w-full h-24 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"><Plus/></div>
                </div>
            </EditorSection>

            <div className="grid grid-cols-2 gap-6">
                <EditorSection title="Precio e Inventario">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2"><TagIcon className="w-5 h-5 text-gray-400"/><Label htmlFor="price" className="mb-0">Precio</Label><Input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className="!mt-0" /></div>
                        <div className="flex items-center gap-2"><Box className="w-5 h-5 text-gray-400"/><Label htmlFor="stock" className="mb-0">Stock Total</Label><Input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} className="!mt-0" /></div>
                        <div className="flex items-center gap-2"><Box className="w-5 h-5 text-gray-400"/><Label htmlFor="sku" className="mb-0">SKU</Label><Input id="sku" name="sku" value={formData.sku} onChange={handleChange} className="!mt-0" /></div>
                    </div>
                </EditorSection>
                <EditorSection title="Variantes">
                     <div className="space-y-2">
                        {formData.variants.map(variant => (
                             <div key={variant.id} className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-gray-800 rounded-md">
                                <Input value={variant.name} className="!py-1"/>
                                <Input value={variant.value} className="!py-1"/>
                                <Input type="number" value={variant.stock} className="!py-1 !w-16"/>
                                <Button variant="secondary" size="sm" className="!p-1"><Trash2 className="w-4 h-4 text-red-500"/></Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="secondary" size="sm" className="mt-2">+ Añadir Variante</Button>
                </EditorSection>
            </div>
        </div>
    );
};

const EditorSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2 dark:border-gray-700">{title}</h3>
        {children}
    </div>
);


export default ProductCatalog;