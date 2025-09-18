import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Hotel, 
    Plane, 
    MapPin,
    Calendar,
    DollarSign,
    FileText,
    Edit,
    Trash2,
    Upload,
    ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import viajesApiService, { 
    Viaje, 
    BookingHotel, 
    BookingVuelo, 
    OtroBooking 
} from '../../../services/viajesApiService';

interface BookingsViajeProps {
    viaje: Viaje;
    onActualizar: (viaje: Viaje) => void;
    onAvanzarFase: () => void;
}

export const BookingsViaje: React.FC<BookingsViajeProps> = ({
    viaje,
    onActualizar,
    onAvanzarFase
}) => {
    const [bookings, setBookings] = useState({
        hoteles: [] as BookingHotel[],
        vuelos: [] as BookingVuelo[],
        otros: [] as OtroBooking[],
        total: 0
    });
    
    const [modalAbierto, setModalAbierto] = useState<'hotel' | 'vuelo' | 'otro' | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarBookings();
    }, []);

    const cargarBookings = async () => {
        try {
            setCargando(true);
            const data = await viajesApiService.getBookingsViaje(viaje.twinId!, viaje.id!);
            setBookings(data);
        } catch (error) {
            console.error('Error cargando bookings:', error);
        } finally {
            setCargando(false);
        }
    };

    const tieneBookingsMinimos = () => {
        // Al menos debe tener un hotel o vuelo
        return bookings.hoteles.length > 0 || bookings.vuelos.length > 0;
    };

    return (
        <div className="space-y-6">
            {/* Header de la fase */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Fase 2: Bookings y Reservas</h2>
                        <p className="text-gray-600 mt-1">
                            Gestiona tus reservas de hoteles, vuelos y otras actividades
                        </p>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Total Reservado:</strong> {bookings.total.toLocaleString()} {viaje.moneda}
                        </p>
                    </div>
                </div>

                {/* Resumen de presupuesto */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Presupuesto Total</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {viaje.presupuestoTotal?.toLocaleString()} {viaje.moneda}
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-blue-600">Total Reservado</p>
                        <p className="text-lg font-semibold text-blue-900">
                            {bookings.total.toLocaleString()} {viaje.moneda}
                        </p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${
                        (viaje.presupuestoTotal || 0) - bookings.total >= 0 
                            ? 'bg-green-50' 
                            : 'bg-red-50'
                    }`}>
                        <p className={`text-sm ${
                            (viaje.presupuestoTotal || 0) - bookings.total >= 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                        }`}>
                            Disponible
                        </p>
                        <p className={`text-lg font-semibold ${
                            (viaje.presupuestoTotal || 0) - bookings.total >= 0 
                                ? 'text-green-900' 
                                : 'text-red-900'
                        }`}>
                            {((viaje.presupuestoTotal || 0) - bookings.total).toLocaleString()} {viaje.moneda}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Sección Hoteles */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Hotel size={20} className="text-blue-600" />
                        <h3 className="text-lg font-medium">Hoteles</h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            {bookings.hoteles.length}
                        </span>
                    </div>
                    <Button
                        onClick={() => setModalAbierto('hotel')}
                        className="flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Agregar Hotel
                    </Button>
                </div>

                {bookings.hoteles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Hotel size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No hay hoteles reservados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.hoteles.map((hotel, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium">{hotel.nombre}</h4>
                                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {hotel.direccion}, {hotel.ciudad}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(hotel.fechaCheckIn).toLocaleDateString()} - 
                                                {new Date(hotel.fechaCheckOut).toLocaleDateString()}
                                                ({hotel.numeroNoches} noches)
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={12} />
                                                {hotel.precioTotal.toLocaleString()} {hotel.moneda}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit size={14} />
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Sección Vuelos */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Plane size={20} className="text-green-600" />
                        <h3 className="text-lg font-medium">Vuelos</h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            {bookings.vuelos.length}
                        </span>
                    </div>
                    <Button
                        onClick={() => setModalAbierto('vuelo')}
                        className="flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Agregar Vuelo
                    </Button>
                </div>

                {bookings.vuelos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Plane size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No hay vuelos reservados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.vuelos.map((vuelo, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium">{vuelo.aerolinea} - {vuelo.numeroVuelo}</h4>
                                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                                            <div>
                                                {vuelo.origen} → {vuelo.destino}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(vuelo.fechaIda).toLocaleDateString()} {vuelo.horaIda}
                                                {vuelo.fechaVuelta && (
                                                    <span> - {new Date(vuelo.fechaVuelta).toLocaleDateString()} {vuelo.horaVuelta}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={12} />
                                                {vuelo.precioTotal.toLocaleString()} {vuelo.moneda}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit size={14} />
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Sección Otros Bookings */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <FileText size={20} className="text-purple-600" />
                        <h3 className="text-lg font-medium">Otros Bookings</h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            {bookings.otros.length}
                        </span>
                    </div>
                    <Button
                        onClick={() => setModalAbierto('otro')}
                        className="flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Agregar Booking
                    </Button>
                </div>

                {bookings.otros.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No hay otros bookings</p>
                        <p className="text-xs mt-1">Tours, seguros, transporte, etc.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.otros.map((booking, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium">{booking.nombre}</h4>
                                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                                            <div>Tipo: {booking.tipo}</div>
                                            {booking.fecha && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(booking.fecha).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={12} />
                                                {booking.precioTotal.toLocaleString()} {booking.moneda}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit size={14} />
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Acciones de avance */}
            {tieneBookingsMinimos() && (
                <div className="flex justify-end">
                    <Button
                        onClick={onAvanzarFase}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        Iniciar Viaje
                        <ArrowRight size={16} />
                    </Button>
                </div>
            )}

            {!tieneBookingsMinimos() && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-yellow-800">
                        <strong>Bookings incompletos:</strong> Para iniciar el viaje, 
                        debes tener al menos un hotel o vuelo reservado.
                    </p>
                </Card>
            )}
        </div>
    );
};
