-- Rename barcode to kode_barang
ALTER TABLE `products` ADD COLUMN `kode_barang` VARCHAR(100) NOT NULL DEFAULT '';
UPDATE `products` SET `kode_barang` = `barcode`;
ALTER TABLE `products` DROP COLUMN `barcode`;

-- Create index on kode_barang
ALTER TABLE `products` ADD INDEX `idx_product_kode` (`kode_barang`);
