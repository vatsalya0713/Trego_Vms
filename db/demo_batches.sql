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
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `batch_id` bigint NOT NULL AUTO_INCREMENT,
  `name` text,
  `salt_composition` varchar(50) DEFAULT NULL,
  `medicine_type` varchar(50) DEFAULT NULL,
  `packing_type` varchar(50) DEFAULT NULL,
  `country_of_origin` varchar(50) DEFAULT NULL,
  `prescription_required` varchar(50) DEFAULT NULL,
  `storage` varchar(50) DEFAULT NULL,
  `manufacture` varchar(50) DEFAULT NULL,
  `bucket_id` int DEFAULT NULL,
  `medicine_id` bigint DEFAULT NULL,
  `batchNumber` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`batch_id`),
  KEY `fk_batches_bucket_id` (`bucket_id`),
  KEY `fk_forigen_medicine_id` (`medicine_id`),
  CONSTRAINT `fk_batches_bucket_id` FOREIGN KEY (`bucket_id`) REFERENCES `bucket` (`id`),
  CONSTRAINT `fk_forigen_medicine_id` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`)
) ENGINE=InnoDB AUTO_INCREMENT=163 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (108,'aaditya','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 20','Cipla',3,19,'AADI-2026-108'),(109,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',4,17,NULL),(110,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',4,15,NULL),(111,'aaditya','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 20','Cipla',4,19,NULL),(112,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',4,16,NULL),(113,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',3,17,NULL),(114,'Paracetamol 500mg','Paracetamol','Tablet','Box','India','No','Store below 25°C','ABC Pharma',3,1,NULL),(115,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',3,15,NULL),(116,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',3,16,NULL),(117,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',5,17,NULL),(118,'aaditya','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 20','Cipla',5,19,NULL),(124,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',2,17,NULL),(125,'Paracetamol 500mg','Paracetamol','Tablet','Box','India','No','Store below 25°C','ABC Pharma',2,1,NULL),(126,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',2,15,NULL),(127,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',2,16,NULL),(128,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',2,15,NULL),(129,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',2,16,NULL),(130,'aaditya','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 20','Cipla',5,22,NULL),(131,'Paracetamol ','Paracetamol 500mg','Tablet','10 tablet','India','No','Store below 25C','Cipla',5,15,NULL),(133,'Naturz Ayurveda Alfalfa Powder','not defined','not defined','not defined','India','NO','Cool & Dry','Royal Nature Land Pvt Ltd',2,25,NULL),(134,'SBL Spigelia 0/14 LM','not defined','not defined','not defined','India','NO','Cool & Dry','SBL Pvt Ltd',2,27,NULL),(135,'Ayusya Nector Plus Capsule','not defined','not defined','not defined','India','NO','Cool & Dry','Ayusya Naturals',6,28,NULL),(136,'Shri Nath Daiocare with Aloe Vera Gel 10gm free','not defined','not defined','not defined','India','NO','Cool & Dry','Shri Nath Pharmacy',6,29,NULL),(137,'Pur Advance Proflo Nipple Small','not defined','not defined','not defined','Thailand','NO','Cool & Dry','Marwar Enterprises',6,30,NULL),(138,'Amalth Salacia Oblonga Extract Veg Capsules','not defined','not defined','not defined','India','NO','Cool & Dry','Amalth Lifecare Pvt. Ltd.',6,31,NULL),(139,'Pur Day Time Soother with Orthodontic Silicone Teats 6m+ Pink','not defined','not defined','not defined','India','NO','Cool & Dry','Marwar Enterprises',6,32,NULL),(140,'Safe-O-Kid Unique High Density L-Shaped 2mtr Long Guard Strip Black 4 Edge','not defined','not defined','not defined','India','NO','Cool & Dry','Baby Safety Inc',6,33,NULL),(141,'SBL Spigelia 0/14 LM','not defined','not defined','not defined','India','NO','Cool & Dry','SBL Pvt Ltd',6,34,NULL),(142,'Pragna Bilva Leaf Powder','not defined','not defined','not defined','India','NO','Cool & Dry','Pragna Herbal & Naturals Pvt Ltd',5,35,NULL),(143,'Safe-O-Kid Child Proof Cabinet Lock Dotted with Smiley Ends Blue','not defined','not defined','not defined','United states','NO','Cool & Dry','Baby Safety Inc',4,36,NULL),(144,'Hahnemann Labs Calcintone Tonic','not defined','not defined','not defined','India','NO','Cool & Dry','Hahnemann Laboratories, Inc',4,37,NULL),(145,'Pur Advance Proflo Nipple Small','not defined','not defined','not defined','Thailand','NO','Cool & Dry','Marwar Enterprises',2,38,NULL),(147,'AccuSure Gold Blood Glucose Test Strip',NULL,NULL,'50 Test Strips','Taiwan',NULL,'','AccuSure Ortho Support',7,40,'ACCU-2026-147'),(148,'Biohome Lycoseg Drop',NULL,NULL,'30 ml Drop','India',NULL,'','Bio Home Pharmacy',7,41,'BIOH-2026-148'),(149,'Dispovan Syringe 3ml with Needle 24G',NULL,NULL,'100 syringes','India',NULL,'','Hindustan Syringes & Medical Devices Ltd',7,42,'DISP-2026-149'),(150,'Bjain Agnus Castus Dilution 6 CH',NULL,NULL,'100 ml Dilution','India',NULL,'','Bjain Pharmaceuticals Pvt Ltd',7,43,'BJAI-2026-150'),(151,'Carmine County Herbal Tisane Tea Premium Rose',NULL,NULL,'30 gm Tea','India',NULL,'','Carmine County Pvt Ltd',7,44,'CARM-2026-151'),(152,'Dispovan 50ml Syringe',NULL,NULL,'10 syringes','India',NULL,'','Hindustan Syringes & Medical Devices Ltd',7,45,'DISP-2026-152'),(153,'Dispovan 10ml Syringe with Needle',NULL,NULL,'50 syringes','India',NULL,'','Hindustan Syringes & Medical Devices Ltd',7,46,'DISP-2026-153'),(154,'Carmine County Herbal Tisane Tea Premium Rose',NULL,NULL,'30 gm Tea','India',NULL,'','Carmine County Pvt Ltd',1,44,'CARM-2026-154'),(155,'Contour Plus One Blood Glucose Monitoring System with Contour Plus Blood Glucose Test Strip 25 Free',NULL,NULL,'1 Unit','Switzerland',NULL,'','Ascensia Diabetes Care India Pvt Ltd',1,47,'CONT-2026-155'),(156,'Cholas Omega-3 Chocolate',NULL,NULL,'250 gm Unit','India',NULL,'','Rgn Foods Pvt Ltd',1,48,'CHOL-2026-156'),(157,'Fasczo Vita X for Men\'s for Increase Stamina Oil',NULL,NULL,'15 ml Oil','India',NULL,'','Natural Healthcare',7,49,'FASC-2026-157'),(158,'VLCC Gold Insta Glow Bleach',NULL,NULL,'6.6 gm Cream','India',NULL,'','VLCC Personal Care Limited',7,50,'VLCC-2026-158'),(159,'Ferengia Tablet',NULL,NULL,'10 tablets','India',NULL,'','Goodman Gilman\'s Life Sciences Private Limited',6,51,'FERE-2026-159'),(161,'Zotide Delivery Device Pen',NULL,NULL,'1 Pen','India',NULL,'','Cipla Ltd',7,52,'ZOTI-2026-161'),(162,'Shri Nath Daiocare with Aloe Vera Gel 10gm free','not defined','not defined','not defined','India','NO','Cool & Dry','Shri Nath Pharmacy',1,53,NULL);
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 11:49:34
