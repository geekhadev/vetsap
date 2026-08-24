<?php

namespace App\Actions\Demo;

use App\Actions\Medic\ClinicalTemplates\CreateClinicalTemplateAction;
use App\Actions\Medic\Doctors\CreateDoctorAction;
use App\Actions\Medic\Doctors\SyncDoctorScheduleAction;
use App\Actions\Medic\Doctors\SyncDoctorServicesAction;
use App\Actions\Medic\Services\CreateServiceAction;
use App\Actions\Store\InventoryMovements\CreateInventoryMovementAction;
use App\Actions\Store\ProductCategories\CreateProductCategoryAction;
use App\Actions\Store\Products\CreateProductAction;
use App\Enums\Medic\DoctorDocumentType;
use App\Enums\Medic\DoctorScheduleDayOfWeek;
use App\Enums\Store\InventoryMovementType;
use App\Models\Company;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Doctor;
use App\Models\Medic\Service;
use App\Models\Medic\Specialty;
use App\Models\Store\MovementCategory;
use App\Models\Store\Product;
use App\Models\Store\ProductCategory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

final class SeedCompanySalesDemoAction
{
    /**
     * @var list<array{name: string, specialty: string, price: string, duration_minutes: int, use_web: bool}>
     */
    private const SERVICES = [
        ['name' => 'Consulta general', 'specialty' => 'Medicina General', 'price' => '20000', 'duration_minutes' => 30, 'use_web' => true],
        ['name' => 'Ecografía', 'specialty' => 'Exámenes', 'price' => '30000', 'duration_minutes' => 30, 'use_web' => false],
        ['name' => 'Tomografía', 'specialty' => 'Exámenes', 'price' => '30000', 'duration_minutes' => 30, 'use_web' => false],
        ['name' => 'Rayos X', 'specialty' => 'Exámenes', 'price' => '30000', 'duration_minutes' => 30, 'use_web' => false],
        ['name' => 'Exámen de sangre', 'specialty' => 'Exámenes', 'price' => '30000', 'duration_minutes' => 30, 'use_web' => false],
    ];

    /**
     * @var list<array{field_key: string, label: string}>
     */
    private const CLINICAL_FIELDS = [
        ['field_key' => 'temperature', 'label' => 'Temperatura (°C)'],
        ['field_key' => 'heart_rate', 'label' => 'Frecuencia cardíaca (lpm)'],
        ['field_key' => 'respiratory_rate', 'label' => 'Frecuencia respiratoria'],
        ['field_key' => 'body_condition', 'label' => 'Condición corporal (1-9)'],
        ['field_key' => 'muscle_condition', 'label' => 'Condición muscular (1-5)'],
        ['field_key' => 'capillary_refill', 'label' => 'Relleno capilar'],
        ['field_key' => 'anamnesis', 'label' => 'Anamnesis'],
        ['field_key' => 'diagnosis', 'label' => 'Diagnóstico'],
        ['field_key' => 'treatment', 'label' => 'Tratamiento'],
        ['field_key' => 'prescription', 'label' => 'Receta'],
    ];

    /**
     * @var list<string>
     */
    private const PRODUCT_CATEGORIES = [
        'Alimentos',
        'Medicamentos',
        'Juguetes',
    ];

    /**
     * @var list<array{name: string, category: string, price: string}>
     */
    private const PRODUCTS = [
        ['name' => 'Alimento canino', 'category' => 'Alimentos', 'price' => '10000'],
        ['name' => 'Alimento felino', 'category' => 'Alimentos', 'price' => '12000'],
        ['name' => 'Medicamento para perro', 'category' => 'Medicamentos', 'price' => '32000'],
        ['name' => 'Medicamento para gato', 'category' => 'Medicamentos', 'price' => '30000'],
        ['name' => 'Juguete para perro', 'category' => 'Juguetes', 'price' => '20000'],
        ['name' => 'Juguete para gato', 'category' => 'Juguetes', 'price' => '22000'],
    ];

    public function __construct(
        private CreateServiceAction $createService,
        private CreateClinicalTemplateAction $createClinicalTemplate,
        private CreateDoctorAction $createDoctor,
        private SyncDoctorServicesAction $syncDoctorServices,
        private SyncDoctorScheduleAction $syncDoctorSchedule,
        private CreateProductCategoryAction $createProductCategory,
        private CreateProductAction $createProduct,
        private CreateInventoryMovementAction $createInventoryMovement,
    ) {}

    /**
     * @return array{
     *     company: string,
     *     services: int,
     *     clinical_template: string,
     *     doctor: string,
     *     product_categories: int,
     *     products: int,
     *     inventory_entry: bool
     * }
     */
    public function execute(Company $company, ?User $user = null): array
    {
        $actingUser = $user ?? $company->owner();

        if ($actingUser === null) {
            throw new RuntimeException('La empresa no tiene un usuario Owner para registrar la entrada de inventario.');
        }

        return DB::transaction(function () use ($company, $actingUser): array {
            $services = $this->seedServices($company);
            $template = $this->seedClinicalTemplate($company);
            $doctor = $this->seedDoctor($company, $services);
            $categories = $this->seedProductCategories($company);
            $products = $this->seedProducts($company, $categories);
            $inventoryEntryCreated = $this->seedInventoryEntry($company, $actingUser, $products);

            return [
                'company' => (string) $company->name,
                'services' => count($services),
                'clinical_template' => (string) $template->name,
                'doctor' => trim("{$doctor->first_name} {$doctor->last_name}"),
                'product_categories' => count($categories),
                'products' => count($products),
                'inventory_entry' => $inventoryEntryCreated,
            ];
        });
    }

    /**
     * @return list<Service>
     */
    private function seedServices(Company $company): array
    {
        $services = [];

        foreach (self::SERVICES as $row) {
            $specialty = Specialty::query()
                ->forCompanyOrGlobal($company->id)
                ->where('name', $row['specialty'])
                ->where('is_active', true)
                ->first();

            if (! $specialty instanceof Specialty) {
                throw new RuntimeException("No se encontró la especialidad activa «{$row['specialty']}».");
            }

            $service = Service::query()
                ->where('company_id', $company->id)
                ->where('name', $row['name'])
                ->first();

            if (! $service instanceof Service) {
                $service = $this->createService->execute([
                    'company_id' => $company->id,
                    'specialty_id' => $specialty->id,
                    'name' => $row['name'],
                    'description' => null,
                    'price' => $row['price'],
                    'duration_minutes' => $row['duration_minutes'],
                    'is_active' => true,
                    'use_web' => $row['use_web'],
                    'is_default' => false,
                ]);
            } else {
                $service->update([
                    'specialty_id' => $specialty->id,
                    'price' => $row['price'],
                    'duration_minutes' => $row['duration_minutes'],
                    'is_active' => true,
                    'use_web' => $row['use_web'],
                ]);
            }

            $services[] = $service;
        }

        return $services;
    }

    private function seedClinicalTemplate(Company $company): ClinicalTemplate
    {
        $existing = ClinicalTemplate::query()
            ->where('company_id', $company->id)
            ->where('name', 'Consulta')
            ->first();

        if ($existing instanceof ClinicalTemplate) {
            return $existing;
        }

        $fields = [];

        foreach (self::CLINICAL_FIELDS as $index => $field) {
            $fields[] = [
                'field_key' => $field['field_key'],
                'label' => $field['label'],
                'field_order' => $index,
                'is_required' => false,
            ];
        }

        return $this->createClinicalTemplate->execute([
            'company_id' => $company->id,
            'species_ids' => [],
            'name' => 'Consulta',
            'description' => null,
            'is_default' => true,
            'is_active' => true,
            'fields' => $fields,
        ]);
    }

    /**
     * @param  list<Service>  $services
     */
    private function seedDoctor(Company $company, array $services): Doctor
    {
        $doctor = Doctor::query()
            ->where('company_id', $company->id)
            ->where('document_type', DoctorDocumentType::Rut)
            ->where('document_number', '12345678-9')
            ->first();

        if (! $doctor instanceof Doctor) {
            $doctor = $this->createDoctor->execute([
                'company_id' => $company->id,
                'document_type' => DoctorDocumentType::Rut,
                'document_number' => '12345678-9',
                'first_name' => 'Juan',
                'last_name' => 'Pérez',
                'phone' => null,
                'email' => null,
                'is_active' => true,
                'use_web' => true,
            ]);
        } else {
            $doctor->update([
                'first_name' => 'Juan',
                'last_name' => 'Pérez',
                'is_active' => true,
                'use_web' => true,
            ]);
        }

        $this->syncDoctorServices->execute(
            $doctor,
            array_map(
                fn (Service $service): array => [
                    'service_id' => $service->id,
                    'duration_override_minutes' => null,
                    'price_override' => null,
                ],
                $services,
            ),
        );

        $blocks = [];

        foreach ([
            DoctorScheduleDayOfWeek::Monday,
            DoctorScheduleDayOfWeek::Tuesday,
            DoctorScheduleDayOfWeek::Wednesday,
            DoctorScheduleDayOfWeek::Thursday,
            DoctorScheduleDayOfWeek::Friday,
            DoctorScheduleDayOfWeek::Saturday,
        ] as $day) {
            $blocks[] = [
                'day_of_week' => $day->value,
                'starts_at' => '09:00',
                'ends_at' => '19:00',
            ];
        }

        $this->syncDoctorSchedule->execute($doctor, $blocks);

        return $doctor->fresh() ?? $doctor;
    }

    /**
     * @return array<string, ProductCategory>
     */
    private function seedProductCategories(Company $company): array
    {
        $categories = [];

        foreach (self::PRODUCT_CATEGORIES as $name) {
            $category = ProductCategory::query()
                ->where('company_id', $company->id)
                ->where('name', $name)
                ->first();

            if (! $category instanceof ProductCategory) {
                $category = $this->createProductCategory->execute([
                    'company_id' => $company->id,
                    'name' => $name,
                    'is_active' => true,
                ]);
            }

            $categories[$name] = $category;
        }

        return $categories;
    }

    /**
     * @param  array<string, ProductCategory>  $categories
     * @return list<Product>
     */
    private function seedProducts(Company $company, array $categories): array
    {
        $products = [];

        foreach (self::PRODUCTS as $row) {
            $category = $categories[$row['category']] ?? null;

            if (! $category instanceof ProductCategory) {
                throw new InvalidArgumentException("Categoría de producto «{$row['category']}» no encontrada.");
            }

            $product = Product::query()
                ->where('company_id', $company->id)
                ->where('name', $row['name'])
                ->first();

            if (! $product instanceof Product) {
                $product = $this->createProduct->execute([
                    'company_id' => $company->id,
                    'product_category_id' => $category->id,
                    'name' => $row['name'],
                    'barcode' => null,
                    'description' => null,
                    'price' => $row['price'],
                    'is_active' => true,
                ]);
            }

            $products[] = $product;
        }

        return $products;
    }

    /**
     * @param  list<Product>  $products
     */
    private function seedInventoryEntry(Company $company, User $user, array $products): bool
    {
        $needsStock = collect($products)->contains(
            fn (Product $product): bool => (int) $product->stock === 0,
        );

        if (! $needsStock) {
            return false;
        }

        $category = MovementCategory::query()
            ->onlyGlobal()
            ->where('type', InventoryMovementType::Entry)
            ->where('name', 'Compra')
            ->where('is_active', true)
            ->first();

        if (! $category instanceof MovementCategory) {
            throw new RuntimeException('No se encontró la categoría de movimiento global «Compra».');
        }

        $details = [];

        foreach ($products as $product) {
            if ((int) $product->stock > 0) {
                continue;
            }

            $details[] = [
                'product_id' => $product->id,
                'quantity' => 100,
            ];
        }

        if ($details === []) {
            return false;
        }

        $this->createInventoryMovement->execute([
            'company_id' => $company->id,
            'type' => InventoryMovementType::Entry->value,
            'moved_at' => now('America/Santiago')->toDateString(),
            'movement_category_id' => $category->id,
            'user_id' => $user->id,
            'details' => $details,
        ]);

        return true;
    }
}
