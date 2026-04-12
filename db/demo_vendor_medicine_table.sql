-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: demo
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `vendor_medicine_table`
--

DROP TABLE IF EXISTS `vendor_medicine_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_medicine_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `medicine_owner` enum('super_admin','vendor') NOT NULL,
  `name` varchar(100) NOT NULL,
  `salt_composition` varchar(100) DEFAULT NULL,
  `manufacturers` varchar(100) DEFAULT NULL,
  `medicine_type` varchar(50) DEFAULT NULL,
  `packaging` varchar(100) DEFAULT NULL,
  `packaging_typ` varchar(50) DEFAULT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `offers_percent` decimal(5,2) DEFAULT NULL,
  `prescription_required` varchar(10) DEFAULT NULL,
  `storage` varchar(200) DEFAULT NULL,
  `country_of_origin` varchar(50) DEFAULT NULL,
  `manufacture_address` varchar(200) DEFAULT NULL,
  `best_price` decimal(10,2) DEFAULT NULL,
  `brought` varchar(50) DEFAULT NULL,
  `image` longtext,
  `added_from` enum('vendor','bucket') NOT NULL DEFAULT 'vendor',
  `bucket_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_medicine_vendor` (`user_id`),
  CONSTRAINT `fk_medicine_vendor` FOREIGN KEY (`user_id`) REFERENCES `vendor_signup` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_medicine_table`
--

LOCK TABLES `vendor_medicine_table` WRITE;
/*!40000 ALTER TABLE `vendor_medicine_table` DISABLE KEYS */;
INSERT INTO `vendor_medicine_table` VALUES (14,2,'super_admin','Paracetamol 650','Paracetamol 654','Cipla Ltd','Tablet','Strip of 15','Blister Pack',120.00,150.00,10.00,123.00,10.00,'0','Store below 20','India','Ahir Wada near SBI BANK, badshahpur',10.00,'500','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1768125946/uploads/rkeqsu65thxex030y6jz.jpg\",\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1768125946/uploads/z1r6wkdswor2zzxxlmkg.jpg\"]','bucket',1,'2026-01-26 16:20:20'),(15,2,'super_admin','XYZ','Paracetamol','Cipla Ltd','Tablet','Strip of 15','Blister Pack',120.00,120.00,10.00,8.00,10.00,'0','Store below 20','India','Badshahpur Sohna Road Highway, Badshahpur, Sector 66, Gurugram, Haryana 122101, India',10.00,'700','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1768151813/uploads/s1fmahwkquqjbit4l7gg.jpg\"]','bucket',2,'2026-01-26 16:20:35'),(16,2,'super_admin','Ibuprofen 400','Ibuprofen','Abbott','Tablet','Strip of 15','Blister Pack',90.00,70.00,7.00,83.70,6.00,'0','Dry Place','India','Goa',75.00,'180','[]','bucket',2,'2026-01-26 17:01:36'),(20,2,'super_admin','abx','paracetamol','xyz','xyz','zyx','avx',120.00,120.00,10.00,10.00,8.00,'0','cool','India','bhopal',10.00,'65','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1768151895/uploads/tdiffxhnpl8d48hyfcxi.jpg\"]','bucket',2,'2026-01-27 15:32:09'),(23,2,'super_admin','Cetirizine','Cetirizine Hydrochloride','Dr Reddy\'s','Tablet','Strip of 10','Blister Pack',40.00,30.00,5.00,38.00,5.00,'0','Cool & Dry Place','India','Hyderabad, Telangana',35.00,'150','[]','bucket',2,'2026-01-27 15:32:09'),(25,2,'super_admin','Pantoprazole 40','Pantoprazole','Alkem Labs','Tablet','Strip of 10','Blister Pack',110.00,85.00,10.00,99.00,8.00,'1','Store below 30°C','India','Sikkim',90.00,'250','[]','bucket',3,'2026-01-27 15:32:09'),(26,2,'super_admin','Vitamin C','Ascorbic Acid','Himalaya','Tablet','Bottle of 60','Bottle',220.00,180.00,15.00,187.00,10.00,'0','Cool Dry Place','India','Bangalore',175.00,'400','[]','bucket',3,'2026-01-27 15:32:09'),(28,2,'super_admin','Cough Syrup','Dextromethorphan','Zydus','Syrup','100 ml','Bottle',95.00,70.00,5.00,90.25,5.00,'0','Store below 25°C','India','Ahmedabad',85.00,'120','[]','bucket',2,'2026-01-27 15:32:09'),(29,2,'super_admin','Digene Gel','Magaldrate','Abbott','Gel','200 ml','Bottle',135.00,110.00,8.00,124.20,7.00,'0','Room Temperature','India','Goa',115.00,'160','[]','bucket',2,'2026-01-27 15:32:09'),(33,2,'super_admin','Metformin 500','Metformin','USV Pvt Ltd','Tablet','Strip of 15','Blister Pack',85.00,65.00,10.00,76.50,8.00,'1','Store below 30°C','India','Daman',70.00,'260','[]','bucket',2,'2026-01-27 15:32:09'),(36,2,'super_admin','Calcium Tablet','Calcium Carbonate','Shelcal','Tablet','Strip of 15','Blister Pack',160.00,130.00,10.00,144.00,10.00,'0','Dry Place','India','Mumbai',135.00,'350','[]','bucket',3,'2026-01-27 17:45:05'),(39,2,'super_admin','ORS Powder','Electrolytes','FDC Ltd','Powder','Packet','Sachet',25.00,18.00,5.00,23.75,5.00,'0','Dry Place','India','Aurangabad',20.00,'500','[]','bucket',1,'2026-01-27 17:50:19'),(40,2,'super_admin','Zinc Tablet','Zinc Sulphate','Cipla Ltd','Tablet','Strip of 10','Blister Pack',55.00,42.00,5.00,52.25,5.00,'0','Cool Place','India','Mumbai',45.00,'420','[]','bucket',2,'2026-01-27 17:52:01'),(41,1,'vendor','Aaditya Kumar','Paracetamol','Cipla Ltds','Tablet','Strip of 35','Blister Pack',120.00,120.00,10.00,120.00,10.00,'0','Store below 25','India','House NO.5 , Near SBI Bank',130.00,'56320',NULL,'vendor',NULL,'2026-01-29 01:27:21'),(42,1,'vendor','Aaditya Kumar','Paracetamol','Cipla Ltd','Tablet','Strip of 15','Blister Pack',130.00,140.00,10.00,130.00,12.00,'0','Store below 25','India','House NO.5 , Near SBI Bank',119.00,'700',NULL,'vendor',NULL,'2026-01-29 01:33:29'),(43,1,'vendor','Misra Store','paracetamol','cas','cas','Strip of 25','csa',149.00,321.00,13.00,311.00,12.00,'0','cool','India','bhopal',123.00,'31',NULL,'vendor',NULL,'2026-01-29 02:00:00'),(44,3,'super_admin','abx','paracetamol','xyz','xyz','zyx','avx',120.00,120.00,10.00,10.00,8.00,'0','cool','India','bhopal',10.00,'65','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1768151895/uploads/tdiffxhnpl8d48hyfcxi.jpg\"]','bucket',2,'2026-01-29 18:05:34'),(45,3,'super_admin','Azithromycin 250','Azithromycin','Sun Pharma','Tablet','Strip of 6','Blister Pack',120.00,95.00,10.00,108.00,8.00,'1','Store below 30°C','India','Vadodara, Gujarat',100.00,'200','[]','bucket',1,'2026-01-29 18:05:34'),(46,3,'super_admin','Amoxicillin 500','Amoxicillin','Mankind Pharma','Capsule','Strip of 10','Blister Pack',180.00,150.00,12.00,158.40,10.00,'1','Store below 25°C','India','New Delhi',145.00,'300','[]','bucket',2,'2026-01-29 18:05:34'),(62,9,'super_admin','Diclofenac Gel','Diclofenac','Voveran','Gel','30 gm','Tube',90.00,70.00,8.00,82.80,6.00,'0','Room Temperature','India','Pune',75.00,'190','[]','bucket',2,'2026-02-03 17:31:35'),(64,9,'super_admin','Amit','paracetamol','cas','cas','Packet','csa',35.00,321.00,5.00,23.75,12.00,'0','cool','India','bhopal',123.00,'31','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1769779154/uploads/fguiabgcqzc2kva5nmzg.jpg\"]','bucket',4,'2026-02-03 17:31:35'),(66,9,'vendor','abx','Electrolytes','abc',NULL,'zyx',NULL,114.00,NULL,20.00,119.00,NULL,'0',NULL,NULL,NULL,NULL,NULL,NULL,'vendor',3,'2026-02-03 17:38:40'),(67,9,'vendor','abx','Electrolytes','abc','cas','zyx','csa',120.00,321.00,22.00,10.00,12.00,'0','cool','India','bhopal',123.00,'31',NULL,'vendor',3,'2026-02-03 17:38:40'),(68,9,'super_admin','abx','paracetamol','xyz','xyz','zyx','avx',120.00,120.00,10.00,10.00,8.00,'0','cool','India','bhopal',10.00,'65','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1768151895/uploads/tdiffxhnpl8d48hyfcxi.jpg\"]','bucket',2,'2026-02-23 17:40:51'),(70,9,'vendor','aaditya131','Paracetamol 500mg','Cipla','Tablet','Strip of 25','csa',55.00,56.00,10.00,45.00,20.00,'1','Store below 20','India','bhopal',10.00,'31',NULL,'vendor',2,'2026-03-25 18:54:52'),(71,9,'super_admin','Shri Nath Daiocare with Aloe Vera Gel 10gm free',NULL,'Shri Nath Pharmacy',NULL,'200 gm Powder',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,175.00,NULL,NULL,'bucket',2,'2026-03-25 19:05:00'),(72,9,'super_admin','Pragna Bilva Leaf Powder',NULL,'Pragna Herbal & Naturals Pvt Ltd',NULL,'200 gm Powder',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,NULL,NULL,NULL,'bucket',3,'2026-04-11 19:42:56'),(73,9,'super_admin','VLCC Gold Insta Glow Bleach',NULL,'VLCC Personal Care Limited',NULL,'6.6 gm Cream',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,NULL,NULL,NULL,'bucket',3,'2026-04-11 19:43:52'),(74,9,'super_admin','Ayusya Nector Plus Capsule',NULL,'Ayusya Naturals',NULL,'60 gm Capsule',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,1000.00,NULL,NULL,'bucket',3,'2026-04-11 19:52:20'),(75,9,'super_admin','Naturz Ayurveda Alfalfa Powder',NULL,'Royal Nature Land Pvt Ltd',NULL,'500 gm Powder',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,1310.00,NULL,NULL,'bucket',3,'2026-04-11 19:52:20'),(76,9,'super_admin','Khadi Naturals Henna and Rosemary Hair Oil',NULL,'Khadi Naturals',NULL,'210 ml Oil',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,NULL,NULL,NULL,'bucket',3,'2026-04-11 19:54:55'),(77,9,'super_admin','Ayusya Nector Plus Capsule',NULL,'Ayusya Naturals',NULL,'60 gm Capsule',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,1000.00,NULL,NULL,'bucket',2,'2026-04-11 19:55:19'),(79,9,'super_admin','Himalaya Personal Care Fresh Start Oil Clear Lemon Face Wash',NULL,'Himalaya Drug Company',NULL,'200 ml Face Wash',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,225.00,NULL,NULL,'bucket',2,'2026-04-11 19:56:28'),(80,9,'super_admin','Jeevan Organics Diabetic Care Kit',NULL,'Jeevan Organics',NULL,'1 Kit',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,NULL,NULL,NULL,'bucket',2,'2026-04-11 21:03:07'),(83,9,'super_admin','Newnik Cozymat, Dry Sheet (Size: 200cm X 260cm) Double Bed Plum',NULL,'Newnik Lifecare Pvt. Ltd',NULL,'1 Sheet',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,2715.00,NULL,NULL,'bucket',2,'2026-04-11 21:19:00'),(84,9,'super_admin','BD Ultra-Fine III Mini Pen Needles 5MM 31G',NULL,'Becton Dickinson India Pvt Ltd',NULL,'5 needles',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,88.00,NULL,NULL,'bucket',2,'2026-04-11 21:44:03'),(85,9,'super_admin','Danta Herbs Herbal Tea Butterfly Blue Pea',NULL,'Danta Herbs Pvt Ltd',NULL,'50 gm Tea',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,499.00,NULL,NULL,'bucket',2,'2026-04-11 21:51:16'),(86,9,'super_admin','Tong Garden Salted Sunflower Kernels',NULL,'Tong Garden Food Marketing (India) Pvt. Ltd.',NULL,'30 gm Seeds',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'Thailand',NULL,NULL,NULL,NULL,'bucket',2,'2026-04-11 21:51:57'),(87,9,'super_admin','Pragna Bilva Leaf Powder',NULL,'Pragna Herbal & Naturals Pvt Ltd',NULL,'200 gm Powder',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,NULL,NULL,NULL,'bucket',2,'2026-04-11 22:03:18'),(88,9,'super_admin','Naturz Ayurveda Alfalfa Powder',NULL,'Royal Nature Land Pvt Ltd',NULL,'500 gm Powder',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,1310.00,NULL,NULL,'bucket',2,'2026-04-11 22:07:08'),(89,9,'super_admin','Pur Day Time Soother with Orthodontic Silicone Teats 6m+ Pink',NULL,'Marwar Enterprises',NULL,'1 Unit',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,NULL,NULL,NULL,'bucket',2,'2026-04-11 22:07:20'),(90,9,'super_admin','SBL Rheum 0/21 LM',NULL,'SBL Pvt Ltd',NULL,'20 gm Globules',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,175.00,NULL,NULL,'bucket',2,'2026-04-11 22:07:47'),(91,9,'super_admin','Amalth Salacia Oblonga Extract Veg Capsules',NULL,'Amalth Lifecare Pvt. Ltd.',NULL,'60 vegicaps',NULL,NULL,NULL,NULL,NULL,NULL,'NO',NULL,'India',NULL,NULL,NULL,NULL,'bucket',3,'2026-04-11 22:08:39');
/*!40000 ALTER TABLE `vendor_medicine_table` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 11:49:36
