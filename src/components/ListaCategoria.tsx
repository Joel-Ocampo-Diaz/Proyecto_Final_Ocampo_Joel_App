import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import './ListaCategoria.css';

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

export const ListaCategoria: React.FC = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriaForm, setCategoriaForm] = useState<Partial<Categoria> | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const toast = useRef<Toast>(null);

    // Fetch de categorías desde la API
    const fetchCategorias = async () => {
        try {
            const response = await fetch('http://localhost:3000/categorias');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error fetching categorias: ${errorMessage}`,
                life: 3000
            });
        }
    };

    // Eliminar una categoría
    const eliminarCategoria = async (id: number) => {
        try {
            await fetch(`http://localhost:3000/categorias/${id}`, {
                method: 'DELETE',
            });
            setCategorias(categorias.filter(categoria => categoria.id !== id));
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Categoría eliminada exitosamente',
                life: 3000
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error eliminando categoría: ${errorMessage}`,
                life: 3000
            });
        }
    };

    // Guardar categoría (agregar o actualizar)
    const guardarCategoria = async () => {
        if (categoriaForm) {
            try {
                const method = isEditMode ? 'PUT' : 'POST';
                const url = isEditMode 
                    ? `http://localhost:3000/categorias/${categoriaForm.id}` 
                    : 'http://localhost:3000/categorias';

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(categoriaForm)
                });

                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                if (isEditMode) {
                    setCategorias(categorias.map(categoria => 
                        categoria.id === data.id ? data : categoria
                    ));
                } else {
                    setCategorias([...categorias, data]);
                }

                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEditMode ? 'Categoría actualizada exitosamente' : 'Categoría agregada exitosamente',
                    life: 3000
                });

                setIsDialogVisible(false);
                setCategoriaForm(null);
                setIsEditMode(false);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Error ${isEditMode ? 'actualizando' : 'agregando'} categoría: ${errorMessage}`,
                    life: 3000
                });
            }
        }
    };

    // Mostrar diálogo de edición
    const showEditDialog = (categoria: Categoria) => {
        setCategoriaForm(categoria);
        setIsEditMode(true);
        setIsDialogVisible(true);
    };

    // Mostrar diálogo de agregar
    const showAddDialog = () => {
        setCategoriaForm({ nombre: '', descripcion: '' });
        setIsEditMode(false);
        setIsDialogVisible(true);
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    return (
        <div className="categorias-container">
            <h1>Gestión de Categorías</h1>
            <Toast ref={toast} />

            <Button 
                label="Agregar Categoría" 
                icon="pi pi-plus" 
                className="p-button-success p-mb-4"
                onClick={showAddDialog}
            />

            <DataTable value={categorias} paginator rows={10} responsiveLayout="scroll" className="p-datatable-gridlines">
                <Column field="id" header="ID" sortable />
                <Column field="nombre" header="Nombre" sortable />
                <Column field="descripcion" header="Descripción" sortable />
                <Column
                    body={(rowData: Categoria) => (
                        <div className="p-d-flex p-ai-center">
                            <Button
                                label="Actualizar"
                                icon="pi pi-pencil"
                                className="p-button-warning p-mr-2"
                                onClick={() => showEditDialog(rowData)}
                            />
                            <Button
                                label="Eliminar"
                                icon="pi pi-trash"
                                className="p-button-danger"
                                onClick={() => eliminarCategoria(rowData.id)}
                            />
                        </div>
                    )}
                    header="Acciones"
                />
            </DataTable>

            {/* Diálogo para agregar o editar categoría */}
            <Dialog
                header={isEditMode ? "Actualizar Categoría" : "Agregar Categoría"}
                visible={isDialogVisible}
                style={{ width: '50vw' }}
                footer={
                    <div>
                        <Button label="Cancelar" icon="pi pi-times" onClick={() => setIsDialogVisible(false)} className="p-button-text" />
                        <Button label="Guardar" icon="pi pi-check" onClick={guardarCategoria} />
                    </div>
                }
                onHide={() => setIsDialogVisible(false)}
            >
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="nombre">Nombre</label>
                        <InputText
                            id="nombre"
                            value={categoriaForm?.nombre || ''}
                            onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="descripcion">Descripción</label>
                        <InputText
                            id="descripcion"
                            value={categoriaForm?.descripcion || ''}
                            onChange={(e) => setCategoriaForm({ ...categoriaForm, descripcion: e.target.value })}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
