-- AlterTable
ALTER TABLE `products` ALTER COLUMN `kode_barang` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `products_kode_barang_key` ON `products`(`kode_barang`);

-- CreateIndex
CREATE INDEX `idx_product_created` ON `products`(`created_at`);
