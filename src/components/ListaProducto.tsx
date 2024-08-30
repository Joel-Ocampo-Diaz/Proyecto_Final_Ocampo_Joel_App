import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import './ListaProducto.css';

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria_id: number;
}

export const ListaProducto: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
    const [newProducto, setNewProducto] = useState<Partial<Producto>>({});
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [mostrarDialogo, setMostrarDialogo] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    // Fetch de productos desde la API
    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/productos');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setProductos(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error fetching productos: ${errorMessage}`,
                life: 3000
            });
            console.error('Error fetching productos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Eliminar un producto
    const eliminarProducto = async (id: number) => {
        try {
            await fetch(`http://localhost:3000/productos/${id}`, {
                method: 'DELETE',
            });
            setProductos(prevProductos => prevProductos.filter(producto => producto.id !== id));
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Producto eliminado exitosamente',
                life: 3000
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error eliminando producto: ${errorMessage}`,
                life: 3000
            });
            console.error('Error eliminando producto:', error);
        }
    };

    // Confirmación de eliminación
    const confirmEliminar = (id: number) => {
        confirmDialog({
            message: '¿Estás seguro de que quieres eliminar este producto?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => eliminarProducto(id)
        });
    };

    // Actualizar producto
    const actualizarProducto = async () => {
        if (!editingProducto) return;

        try {
            await fetch(`http://localhost:3000/productos/${editingProducto.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProducto)
            });
            setProductos(prevProductos => prevProductos.map(producto =>
                producto.id === editingProducto.id ? editingProducto : producto
            ));
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Producto actualizado exitosamente',
                life: 3000
            });
            setDialogVisible(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error actualizando producto: ${errorMessage}`,
                life: 3000
            });
            console.error('Error actualizando producto:', error);
        }
    };

    // Mostrar dialogo de actualización
    const showUpdateDialog = (producto: Producto) => {
        setEditingProducto(producto);
        setDialogVisible(true);
    };

    // Función para agregar un producto
    const agregarProducto = async () => {
        try {
            const response = await fetch('http://localhost:3000/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProducto)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setProductos(prevProductos => [...prevProductos, data]);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Producto agregado exitosamente',
                life: 3000
            });
            setMostrarDialogo(false);
            setNewProducto({});
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error agregando producto: ${errorMessage}`,
                life: 3000
            });
            console.error('Error agregando producto:', error);
        }
    };

    // Plantilla de acciones (actualizar y eliminar)
    const actionTemplate = (rowData: Producto) => {
        return (
            <div className="p-d-flex p-ai-center">
                <Button
                    label="Actualizar"
                    icon="pi pi-pencil"
                    className="p-button-warning p-mr-2"
                    onClick={() => showUpdateDialog(rowData)}
                />
                <Button
                    label="Eliminar"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={() => confirmEliminar(rowData.id)}
                />
            </div>
        );
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    return (
        <div className="productos-container">
            <h1>Gestión de Productos</h1>
            <Toast ref={toast} />
            <ConfirmDialog />

            <Button 
                label="Agregar Producto" 
                icon="pi pi-plus" 
                className="p-button-success p-mb-4"
                onClick={() => setMostrarDialogo(true)}
            />

            {loading ? (
                <div className="p-d-flex p-jc-center p-ai-center">
                    <i className="pi pi-spinner p-spin p-mr-2" style={{ fontSize: '2em' }}></i>
                    <span>Cargando...</span>
                </div>
            ) : (
                <DataTable value={productos} paginator rows={10} responsiveLayout="scroll" className="p-datatable-gridlines">
                    <Column field="id" header="ID" sortable />
                    <Column field="nombre" header="Nombre" sortable />
                    <Column field="descripcion" header="Descripción" sortable />
                    <Column field="precio" header="Precio" sortable />
                    <Column field="categoria_id" header="Categoría ID" sortable />
                    <Column body={actionTemplate} header="Acciones" />
                </DataTable>
            )}

            {/* Dialogo de actualización */}
            <Dialog
                header="Actualizar Producto"
                visible={dialogVisible}
                style={{ width: '50vw' }}
                footer={
                    <div>
                        <Button label="Cancelar" icon="pi pi-times" onClick={() => setDialogVisible(false)} className="p-button-text" />
                        <Button label="Actualizar" icon="pi pi-check" onClick={actualizarProducto} />
                    </div>
                }
                onHide={() => setDialogVisible(false)}
            >
                {editingProducto && (
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText
                                id="nombre"
                                value={editingProducto.nombre || ''}
                                onChange={(e) => setEditingProducto({ ...editingProducto, nombre: e.target.value })}
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputText
                                id="descripcion"
                                value={editingProducto.descripcion || ''}
                                onChange={(e) => setEditingProducto({ ...editingProducto, descripcion: e.target.value })}
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="precio">Precio</label>
                            <InputText
                                id="precio"
                                type="number"
                                value={String(editingProducto.precio || '')}
                                onChange={(e) => setEditingProducto({ ...editingProducto, precio: Number(e.target.value) })}
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="categoria_id">Categoría ID</label>
                            <InputText
                                id="categoria_id"
                                type="number"
                                value={String(editingProducto.categoria_id || '')}
                                onChange={(e) => setEditingProducto({ ...editingProducto, categoria_id: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Dialogo para agregar nuevo producto */}
            <Dialog
                header="Agregar Nuevo Producto"
                visible={mostrarDialogo}
                style={{ width: '50vw' }}
                footer={
                    <div>
                        <Button label="Cancelar" icon="pi pi-times" onClick={() => setMostrarDialogo(false)} className="p-button-text" />
                        <Button label="Guardar" icon="pi pi-check" onClick={agregarProducto} />
                    </div>
                }
                onHide={() => setMostrarDialogo(false)}
            >
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="txtNombre">Nombre</label>
                        <InputText
                            id="txtNombre"
                            value={newProducto.nombre || ''}
                            onChange={(e) => setNewProducto({ ...newProducto, nombre: e.target.value })}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="txtDescripcion">Descripción</label>
                        <InputText
                            id="txtDescripcion"
                            value={newProducto.descripcion || ''}
                            onChange={(e) => setNewProducto({ ...newProducto, descripcion: e.target.value })}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="txtPrecio">Precio</label>
                        <InputText
                            id="txtPrecio"
                            type="number"
                            value={String(newProducto.precio || '')}
                            onChange={(e) => setNewProducto({ ...newProducto, precio: Number(e.target.value) })}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="txtCategoria">Categoría ID</label>
                        <InputText
                            id="txtCategoria"
                            type="number"
                            value={String(newProducto.categoria_id || '')}
                            onChange={(e) => setNewProducto({ ...newProducto, categoria_id: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
