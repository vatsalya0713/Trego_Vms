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
-- Table structure for table `bucket`
--

DROP TABLE IF EXISTS `bucket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bucket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `image` longtext,
  `capacity` varchar(30) DEFAULT NULL,
  `number_medicines` int DEFAULT '0',
  `created_by` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(50) DEFAULT NULL,
  `category_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bucket`
--

LOCK TABLES `bucket` WRITE;
/*!40000 ALTER TABLE `bucket` DISABLE KEYS */;
INSERT INTO `bucket` VALUES (1,'b1','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1768125489/uploads/kj86fhza4i6xgzs43d03.jpg\"]','small',50,'paracetamol','2026-01-10 18:30:00','pharmacy','retailer'),(2,'Samll','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1768132387/uploads/g10n0rgprkr0qmovcs0o.jpg\"]','medium',60,'XYZ','2026-01-11 18:30:00','pharmacy','wholesaler'),(3,'cdc','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1769255400/uploads/uqyjn8wknj2xkzwkqeme.jpg\"]','da',12,'cs','2026-01-29 18:30:00','pharmacy','wholesaler'),(4,'small','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1769735018/uploads/xzeslmitkh2suqbjk6m9.jpg\"]','samll',60,'aca','2026-01-29 18:30:00','pharmacy','retailer'),(5,'ABC','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1771956865/uploads/gwwkdbgu2ivqy8lqy4w8.jpg\"]','Small',10,'XYZ','2026-02-23 18:30:00','pharmacy','retailer'),(6,'Super','[\"https://res.cloudinary.com/dxoy1r7v8/image/upload/v1774081143/uploads/xra5isqidqkxulquflof.jpg\"]','Large',1000,'abc','2026-03-20 18:30:00','pharmacy','super_stockist'),(7,'ced','[]','small',10,'dse','2026-03-22 18:30:00','pharmacy','wholesaler');
/*!40000 ALTER TABLE `bucket` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 11:49:37
