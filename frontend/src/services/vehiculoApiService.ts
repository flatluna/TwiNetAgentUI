// services/vehiculoApiService.ts
// Servicio para conectar con el endpoint del backend para crear vehículos

import { useCallback } from 'react';

export interface CreateCarRequest {
  // Información básica requerida - COINCIDE CON BACKEND C#
  StockNumber?: string;
  Make?: string;
  Model?: string;
  Year: number;
  Trim?: string;
  SubModel?: string;
  BodyStyle?: string;
  Doors?: number;
  LicensePlate?: string;
  PlateState?: string;
  Vin?: string;

  // Especificaciones técnicas
  Transmission?: string;
  Drivetrain?: string;
  FuelType?: string;
  EngineDescription?: string;
  Cylinders?: number;
  EngineDisplacementLiters?: number;
  Mileage?: number;
  MileageUnit?: string;
  OdometerStatus?: string;

  // Colores y apariencia
  ExteriorColor?: string;
  InteriorColor?: string;
  Upholstery?: string;

  // Estado y condición
  Condition?: string;
  StockStatus?: string;
  HasOpenRecalls?: boolean;
  HasAccidentHistory?: boolean;
  IsCertifiedPreOwned?: boolean;

  // Fechas y adquisición (como strings ISO para enviar al backend)
  DateAcquired?: string;
  DateListed?: string;
  AcquisitionSource?: string;

  // Ubicación
  AddressComplete?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
  Latitude?: number;
  Longitude?: number;
  ParkingLocation?: string;

  // Información financiera - Campos exactos del backend
  OriginalListPrice?: number;
  ListPrice?: number;
  CurrentPrice?: number;
  ActualPaidPrice?: number;
  EstimatedTax?: number;
  EstimatedRegistrationFee?: number;
  DealerProcessingFee?: number;

  // Financiamiento
  MonthlyPayment?: number;
  Apr?: number;
  TermMonths?: number;
  DownPayment?: number;

  // Características
  StandardFeatures?: string[];
  OptionalFeatures?: string[];
  SafetyFeatures?: string[];

  // Título
  TitleBrand?: string;
  HasLien?: boolean;
  LienHolder?: string;
  LienAmount?: number;
  TitleState?: string;

  // Garantía (como strings ISO para enviar al backend)
  WarrantyType?: string;
  WarrantyStart?: string;
  WarrantyEnd?: string;
  WarrantyProvider?: string;

  // Multimedia (simplificado para el backend)
  Photos?: string[];
  VideoUrl?: string;

  // Notas
  InternalNotes?: string;
  Description?: string;

  // Estado de propiedad
  Estado?: string;

  // Metadatos
  CreatedBy?: string;

  // Required Twin ID
  TwinId?: string;
}

export interface CreateCarResponse {
  success: boolean;
  carData?: any;
  error?: string;
}

// Interface para la respuesta del GET cars (coincide con backend)
export interface GetCarsResponse {
  success: boolean;
  data: Car[];
  count: number;
  message: string;
}

// Interface para un vehículo individual en la respuesta
export interface Car {
  id?: string;
  twinID?: string;
  
  // Campos básicos (compatible con ambos formatos)
  make?: string;
  Make?: string;
  model?: string;
  Model?: string;
  year?: number;
  Year?: number;
  licensePlate?: string;
  LicensePlate?: string;
  vin?: string;
  Vin?: string;
  
  // Precios - Usando campos exactos del backend
  originalListPrice?: number;
  listPrice?: number;
  ListPrice?: number; // Compatibilidad
  currentPrice?: number;
  CurrentPrice?: number; // Compatibilidad  
  actualPaidPrice?: number;
  
  // Especificaciones
  mileage?: number;
  Mileage?: number;
  mileageUnit?: string;
  MileageUnit?: string;
  condition?: string;
  Condition?: string;
  estado?: string;
  Estado?: string;
  
  // Colores
  exteriorColor?: string;
  ExteriorColor?: string;
  interiorColor?: string;
  InteriorColor?: string;
  
  // Fechas
  dateAcquired?: string;
  DateAcquired?: string;
  dateListed?: string;
  DateListed?: string;
  
  // Ubicación
  addressComplete?: string;
  AddressComplete?: string;
  city?: string;
  City?: string;
  state?: string;
  State?: string;
  postalCode?: string;
  PostalCode?: string;
  parkingLocation?: string;
  ParkingLocation?: string;
  
  // Información del vehículo
  stockNumber?: string;
  StockNumber?: string;
  trim?: string;
  Trim?: string;
  bodyStyle?: string;
  BodyStyle?: string;
  transmission?: string;
  Transmission?: string;
  fuelType?: string;
  FuelType?: string;
  description?: string;
  Description?: string;
  
  // Fotos
  photos?: string[];
  Photos?: string[];
  
  // Campos adicionales del backend camelCase
  subModel?: string;
  doors?: number;
  plateState?: string;
  drivetrain?: string;
  engineDescription?: string;
  cylinders?: number;
  engineDisplacementLiters?: number;
  odometerStatus?: string;
  upholstery?: string;
  stockStatus?: string;
  hasOpenRecalls?: boolean;
  hasAccidentHistory?: boolean;
  isCertifiedPreOwned?: boolean;
  acquisitionSource?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  estimatedTax?: number;
  estimatedRegistrationFee?: number;
  dealerProcessingFee?: number;
  monthlyPayment?: number;
  apr?: number;
  termMonths?: number;
  downPayment?: number;
  standardFeatures?: string[];
  optionalFeatures?: string[];
  safetyFeatures?: string[];
  titleBrand?: string;
  hasLien?: boolean;
  lienHolder?: string;
  lienAmount?: number;
  titleState?: string;
  warrantyType?: string;
  warrantyStart?: string;
  warrantyEnd?: string;
  warrantyProvider?: string;
  videoUrl?: string;
  internalNotes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  type?: string;
}

class VehiculoApiService {
  private baseUrl = '/api/twins';

  /**
   * Crear un nuevo vehículo usando el endpoint del backend
   */
  async createCar(twinId: string, carData: CreateCarRequest): Promise<CreateCarResponse> {
    try {
      console.log('🚗 Enviando datos del vehículo al backend:', {
        twinId,
        endpoint: `${this.baseUrl}/${twinId}/cars`,
        payload: carData
      });

      // Validar y limpiar datos antes de enviar
      const cleanedData = this.cleanCarData(carData);
      const jsonString = JSON.stringify(cleanedData, null, 2);
      
      console.log('📋 JSON a enviar (primeros 500 chars):', jsonString.substring(0, 500) + '...');
      
      // Verificar que el JSON es válido
      try {
        JSON.parse(jsonString);
        console.log('✅ JSON es válido');
      } catch (jsonError) {
        console.error('❌ JSON inválido:', jsonError);
        throw new Error(`JSON inválido: ${jsonError}`);
      }

      const response = await fetch(`${this.baseUrl}/${twinId}/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación cuando esté disponible
          // 'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: jsonString
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error del servidor:', response.status, errorData);
        throw new Error(`Error al crear vehículo: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Vehículo creado exitosamente:', result);

      return {
        success: true,
        carData: result
      };
    } catch (error) {
      console.error('❌ Error al crear vehículo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener un vehículo específico por ID
   */
  async getCarById(twinId: string, carId: string): Promise<Car> {
    try {
      console.log(`🚗 Obteniendo vehículo ${carId} para Twin ${twinId}`);

      const response = await fetch(`${this.baseUrl}/${twinId}/cars/${carId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Vehículo obtenido exitosamente:', result.data);
        return result.data as Car;
      } else {
        console.error('❌ Error al obtener vehículo:', result.error);
        throw new Error(result.error || 'Error al obtener vehículo');
      }
    } catch (error) {
      console.error('❌ Error al obtener vehículo:', error);
      throw error;
    }
  }

  /**
   * Actualizar un vehículo existente
   */
  async updateCar(twinId: string, carId: string, carData: CreateCarRequest): Promise<CreateCarResponse> {
    try {
      console.log(`🚗 Actualizando vehículo ${carId} para Twin ${twinId}:`, carData);

      // Validar y limpiar datos antes de enviar
      const cleanedData = this.cleanCarData(carData);
      const jsonString = JSON.stringify(cleanedData, null, 2);

      const response = await fetch(`${this.baseUrl}/${twinId}/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonString
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error al actualizar vehículo:', response.status, errorData);
        throw new Error(`Error al actualizar vehículo: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Vehículo actualizado exitosamente:', result);

      return {
        success: true,
        carData: result
      };
    } catch (error) {
      console.error('❌ Error al actualizar vehículo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Limpiar y validar datos del vehículo antes de enviar
   */
  private cleanCarData(carData: CreateCarRequest): CreateCarRequest {
    const cleaned: any = {};
    
    // Copiar solo campos definidos y limpiar valores problemáticos
    Object.entries(carData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Manejar arrays
        if (Array.isArray(value)) {
          if (value.length > 0) {
            cleaned[key] = value.filter(item => item && item.trim && item.trim() !== '');
          }
        }
        // Manejar números
        else if (typeof value === 'number') {
          if (!isNaN(value) && isFinite(value)) {
            cleaned[key] = value;
          }
        }
        // Manejar strings
        else if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed !== '') {
            cleaned[key] = trimmed;
          }
        }
        // Manejar booleanos y objetos
        else {
          cleaned[key] = value;
        }
      }
    });
    
    console.log('🧹 Datos limpiados:', cleaned);
    return cleaned as CreateCarRequest;
  }

  /**
   * Obtener vehículos por TwinId
   */
  async getCarsByTwinId(twinId: string): Promise<GetCarsResponse> {
    try {
      console.log('🚗 Obteniendo vehículos para Twin ID:', twinId);

      const response = await fetch(`${this.baseUrl}/${twinId}/cars`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error al obtener vehículos:', response.status, errorData);
        throw new Error(`Error al obtener vehículos: ${response.status} - ${errorData}`);
      }

      const result: GetCarsResponse = await response.json();
      console.log('✅ Vehículos obtenidos exitosamente:', {
        success: result.success,
        count: result.count,
        message: result.message,
        vehiculos: result.data?.length || 0
      });

      // Debug: Mostrar estructura completa del primer vehículo
      if (result.data && result.data.length > 0) {
        console.log('🔍 Estructura del primer vehículo del backend:', result.data[0]);
        console.log('🔍 Precios específicos del primer vehículo:', {
          originalListPrice: result.data[0].originalListPrice,
          listPrice: result.data[0].listPrice,
          currentPrice: result.data[0].currentPrice,
          actualPaidPrice: result.data[0].actualPaidPrice,
          // También revisar posibles campos en mayúscula usando acceso dinámico
          OriginalListPrice: (result.data[0] as any).OriginalListPrice,
          ListPrice: (result.data[0] as any).ListPrice,
          CurrentPrice: (result.data[0] as any).CurrentPrice,
          ActualPaidPrice: (result.data[0] as any).ActualPaidPrice
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error);
      throw error; // Cambiar para que sea consistente con createCar
    }
  }
}

/**
 * Hook para manejar operaciones de vehículos
 */
export function useVehiculoService() {
  const vehiculoService = new VehiculoApiService();

  const crearVehiculo = async (formData: any, twinId: string) => {
    try {
      // Validar datos antes de enviar
      if (!formData.make || !formData.model || !formData.year || !formData.licensePlate) {
        throw new Error('Campos requeridos faltantes: Marca, Modelo, Año y Placa');
      }

      if (!twinId) {
        throw new Error('TwinId es requerido');
      }

      // Mapear datos del formulario al formato esperado por el backend
      const carRequest = mapFormDataToCarRequest(formData);

      console.log('🚗 Enviando datos al backend:', {
        twinId,
        endpoint: `/api/twins/${twinId}/cars`,
        payload: carRequest
      });

      // Enviar al backend
      const response = await vehiculoService.createCar(twinId, carRequest);

      if (response.success && response.carData) {
        console.log('✅ Vehículo creado exitosamente:', response.carData);
        return response.carData;
      } else {
        throw new Error(response.error || 'Error al crear vehículo');
      }
    } catch (error) {
      console.error('❌ Error al crear vehículo:', error);
      throw error;
    }
  };

  const obtenerVehiculos = useCallback(async (twinId: string): Promise<Car[]> => {
    try {
      console.log('🚗 Obteniendo vehículos para Twin:', twinId);
      
      const response: GetCarsResponse = await vehiculoService.getCarsByTwinId(twinId);
      
      console.log('✅ Respuesta del backend:', {
        success: response.success,
        count: response.count,
        message: response.message
      });
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error);
      throw error;
    }
  }, []);

  const obtenerVehiculoPorId = useCallback(async (twinId: string, carId: string): Promise<Car> => {
    try {
      console.log('🚗 Obteniendo vehículo por ID:', { twinId, carId });
      
      const vehiculo = await vehiculoService.getCarById(twinId, carId);
      
      console.log('✅ Vehículo obtenido:', vehiculo);
      return vehiculo;
    } catch (error) {
      console.error('❌ Error al obtener vehículo por ID:', error);
      throw error;
    }
  }, []);

  const actualizarVehiculo = async (twinId: string, carId: string, formData: any) => {
    try {
      // Validar datos antes de enviar
      if (!formData.make || !formData.model || !formData.year || !formData.licensePlate) {
        throw new Error('Campos requeridos faltantes: Marca, Modelo, Año y Placa');
      }

      if (!twinId || !carId) {
        throw new Error('TwinId y CarId son requeridos');
      }

      // Mapear datos del formulario al formato esperado por el backend
      const carRequest = mapFormDataToCarRequest(formData);

      console.log('🚗 Actualizando vehículo:', {
        twinId,
        carId,
        endpoint: `/api/twins/${twinId}/cars/${carId}`,
        payload: carRequest
      });

      // Enviar al backend
      const response = await vehiculoService.updateCar(twinId, carId, carRequest);

      if (response.success && response.carData) {
        console.log('✅ Vehículo actualizado exitosamente:', response.carData);
        return response.carData;
      } else {
        throw new Error(response.error || 'Error al actualizar vehículo');
      }
    } catch (error) {
      console.error('❌ Error al actualizar vehículo:', error);
      throw error;
    }
  };

  // Función para subir múltiples fotos de un vehículo
  const subirFotosVehiculo = useCallback(async (twinId: string, carId: string, files: FileList) => {
    try {
      console.log('📸 Subiendo fotos para vehículo:', { twinId, carId, fileCount: files.length });

      // Validar que todos los archivos sean imágenes
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const invalidFiles = Array.from(files).filter(file => !validImageTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        throw new Error(`Archivos no válidos: ${invalidFiles.map(f => f.name).join(', ')}. Solo se permiten imágenes.`);
      }

      const urlsSubidas: string[] = [];

      // Subir cada archivo individualmente usando simple-upload-photo con path de cars
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('photo', file);

        console.log(`📸 Subiendo archivo ${i + 1}/${files.length}:`, file.name);

        const response = await fetch(`/api/twins/${twinId}/simple-upload-photo/cars/${carId}/photos`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const uploadResult = await response.json();
          console.log(`✅ Archivo ${i + 1} subido:`, uploadResult);
          
          // Extraer la URL del resultado
          const photoUrl = uploadResult.photoUrl || uploadResult.url || uploadResult.filePath;
          if (photoUrl) {
            urlsSubidas.push(photoUrl);
          } else {
            console.warn(`⚠️ Archivo ${file.name} subido pero sin URL en respuesta:`, uploadResult);
          }
        } else {
          const errorData = await response.text();
          console.error(`❌ Error subiendo archivo ${file.name}:`, response.status, errorData);
        }
      }

      // Retornar resultado similar al backend esperado
      return {
        Success: urlsSubidas.length > 0,
        TwinId: twinId,
        CarId: carId,
        TotalPhotos: files.length,
        SuccessfulUploads: urlsSubidas.length,
        FailedUploads: files.length - urlsSubidas.length,
        Results: urlsSubidas.map(url => ({ photoUrl: url, success: true })),
        Message: `${urlsSubidas.length} foto(s) subida(s) exitosamente`
      };
    } catch (error) {
      console.error('❌ Error al subir fotos del vehículo:', error);
      throw error;
    }
  }, []);

  // Función para subir documentos de seguro auto
  const uploadCarInsurance = useCallback(async (twinId: string, carId: string, files: FileList, filePath: string = 'seguro-auto') => {
    try {
      console.log('🛡️ Subiendo seguro auto para vehículo:', { twinId, carId, fileCount: files.length, filePath });

      // Validar tipos de archivo permitidos para documentos
      const validDocumentTypes = [
        'application/pdf',
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      const invalidFiles = Array.from(files).filter(file => !validDocumentTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        throw new Error(`Archivos no válidos: ${invalidFiles.map(f => f.name).join(', ')}. Solo se permiten PDF, DOC, DOCX e imágenes.`);
      }

      const resultados = [];

      // Subir cada archivo individualmente
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        console.log(`🛡️ Subiendo documento ${i + 1}/${files.length}:`, file.name);

        // Usar el endpoint específico para seguro auto con path cars
        const response = await fetch(`/api/twins/${twinId}/${carId}/upload-car-insurance/${filePath}`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const uploadResult = await response.json();
          console.log(`✅ Documento ${i + 1} subido:`, uploadResult);
          
          resultados.push({
            fileName: file.name,
            success: true,
            result: uploadResult
          });
        } else {
          const errorData = await response.text();
          console.error(`❌ Error subiendo documento ${file.name}:`, response.status, errorData);
          
          resultados.push({
            fileName: file.name,
            success: false,
            error: errorData
          });
        }
      }

      const sucessfulUploads = resultados.filter(r => r.success).length;
      const failedUploads = files.length - sucessfulUploads;

      // Retornar resultado consolidado
      return {
        Success: sucessfulUploads > 0,
        TwinId: twinId,
        CarId: carId,
        FilePath: filePath,
        TotalFiles: files.length,
        SuccessfulUploads: sucessfulUploads,
        FailedUploads: failedUploads,
        Results: resultados,
        Message: `${sucessfulUploads} documento(s) de seguro auto subido(s) exitosamente`
      };
    } catch (error) {
      console.error('❌ Error al subir seguro auto:', error);
      throw error;
    }
  }, []);

  return {
    crearVehiculo,
    obtenerVehiculos,
    obtenerVehiculoPorId,
    actualizarVehiculo,
    subirFotosVehiculo,
    uploadCarInsurance
  };
}

/**
 * Mapear datos del formulario al formato esperado por el backend (PascalCase)
 */
export function mapFormDataToCarRequest(formData: any): CreateCarRequest {
  return {
    // Información básica - CONVERTIR A PASCALCASE
    StockNumber: formData.stockNumber || formData.StockNumber || undefined,
    Make: formData.make || formData.Make,
    Model: formData.model || formData.Model,
    Year: Number(formData.year || formData.Year),
    Trim: formData.trim || formData.Trim || undefined,
    SubModel: formData.subModel || formData.SubModel || undefined,
    BodyStyle: formData.bodyStyle || formData.BodyStyle || undefined,
    Doors: formData.doors ? Number(formData.doors) : undefined,
    LicensePlate: formData.licensePlate || formData.LicensePlate,
    PlateState: formData.plateState || formData.PlateState || undefined,
    Vin: formData.vin || formData.Vin || undefined,

    // Especificaciones técnicas
    Transmission: formData.transmission || formData.Transmission || undefined,
    Drivetrain: formData.drivetrain || formData.Drivetrain || undefined,
    FuelType: formData.fuelType || formData.FuelType || undefined,
    EngineDescription: formData.engineDescription || formData.EngineDescription || undefined,
    Cylinders: formData.cylinders ? Number(formData.cylinders) : undefined,
    EngineDisplacementLiters: formData.engineDisplacementLiters ? Number(formData.engineDisplacementLiters) : undefined,
    Mileage: formData.mileage ? Number(formData.mileage) : undefined,
    MileageUnit: formData.mileageUnit || formData.MileageUnit || undefined,
    OdometerStatus: formData.odometerStatus || formData.OdometerStatus || undefined,

    // Colores y apariencia
    ExteriorColor: formData.exteriorColor || formData.ExteriorColor || undefined,
    InteriorColor: formData.interiorColor || formData.InteriorColor || undefined,
    Upholstery: formData.upholstery || formData.Upholstery || undefined,

    // Estado y condición
    Condition: formData.condition || formData.Condition || undefined,
    StockStatus: formData.stockStatus || formData.StockStatus || undefined,
    HasOpenRecalls: formData.hasOpenRecalls || formData.HasOpenRecalls || false,
    HasAccidentHistory: formData.hasAccidentHistory || formData.HasAccidentHistory || false,
    IsCertifiedPreOwned: formData.isCertifiedPreOwned || formData.IsCertifiedPreOwned || false,

    // Fechas y adquisición
    DateAcquired: formData.dateAcquired || formData.DateAcquired || undefined,
    DateListed: formData.dateListed || formData.DateListed || undefined,
    AcquisitionSource: formData.acquisitionSource || formData.AcquisitionSource || undefined,

    // Ubicación
    AddressComplete: formData.addressComplete || formData.AddressComplete || undefined,
    City: formData.city || formData.City || undefined,
    State: formData.state || formData.State || undefined,
    PostalCode: formData.postalCode || formData.PostalCode || undefined,
    Country: formData.country || formData.Country || undefined,
    Latitude: formData.latitude ? Number(formData.latitude) : undefined,
    Longitude: formData.longitude ? Number(formData.longitude) : undefined,
    ParkingLocation: formData.parkingLocation || formData.ParkingLocation || undefined,

    // Información financiera
    OriginalListPrice: formData.originalListPrice ? Number(formData.originalListPrice) : undefined,
    ListPrice: formData.listPrice ? Number(formData.listPrice) : undefined,
    CurrentPrice: formData.currentPrice ? Number(formData.currentPrice) : undefined,
    ActualPaidPrice: formData.actualPaidPrice ? Number(formData.actualPaidPrice) : undefined,
    EstimatedTax: formData.estimatedTax ? Number(formData.estimatedTax) : undefined,
    EstimatedRegistrationFee: formData.estimatedRegistrationFee ? Number(formData.estimatedRegistrationFee) : undefined,
    DealerProcessingFee: formData.dealerProcessingFee ? Number(formData.dealerProcessingFee) : undefined,

    // Financiamiento
    MonthlyPayment: formData.monthlyPayment ? Number(formData.monthlyPayment) : undefined,
    Apr: formData.apr ? Number(formData.apr) : undefined,
    TermMonths: formData.termMonths ? Number(formData.termMonths) : undefined,
    DownPayment: formData.downPayment ? Number(formData.downPayment) : undefined,

    // Características (convertir strings separados por comas a arrays, o usar arrays directamente)
    StandardFeatures: Array.isArray(formData.standardFeatures) 
      ? formData.standardFeatures 
      : formData.standardFeatures 
        ? formData.standardFeatures.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
        : undefined,
    OptionalFeatures: Array.isArray(formData.optionalFeatures)
      ? formData.optionalFeatures
      : formData.optionalFeatures
        ? formData.optionalFeatures.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
        : undefined,
    SafetyFeatures: Array.isArray(formData.safetyFeatures)
      ? formData.safetyFeatures
      : formData.safetyFeatures
        ? formData.safetyFeatures.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
        : undefined,

    // Título
    TitleBrand: formData.titleBrand || formData.TitleBrand || undefined,
    HasLien: formData.hasLien || formData.HasLien || false,
    LienHolder: formData.lienHolder || formData.LienHolder || undefined,
    LienAmount: formData.lienAmount ? Number(formData.lienAmount) : undefined,
    TitleState: formData.titleState || formData.TitleState || undefined,

    // Garantía
    WarrantyType: formData.warrantyType || formData.WarrantyType || undefined,
    WarrantyStart: formData.warrantyStart || formData.WarrantyStart || undefined,
    WarrantyEnd: formData.warrantyEnd || formData.WarrantyEnd || undefined,
    WarrantyProvider: formData.warrantyProvider || formData.WarrantyProvider || undefined,

    // Multimedia (simplificar para backend - solo URLs de fotos)
    Photos: formData.photos 
      ? Array.isArray(formData.photos)
        ? formData.photos.map((photo: any) => typeof photo === 'string' ? photo : photo.url)
        : [formData.photos]
      : undefined,
    VideoUrl: formData.videoUrl || formData.VideoUrl || undefined,

    // Notas
    InternalNotes: formData.internalNotes || formData.InternalNotes || undefined,
    Description: formData.description || formData.Description || undefined,

    // Estado de propiedad
    Estado: formData.estado || formData.Estado || undefined,

    // Metadatos
    CreatedBy: formData.createdBy || formData.CreatedBy || 'frontend-user',

    // Required TwinId
    TwinId: formData.twinId || formData.TwinId
  };
}