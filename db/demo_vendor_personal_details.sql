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
-- Table structure for table `vendor_personal_details`
--

DROP TABLE IF EXISTS `vendor_personal_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_personal_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `applicant_id` int NOT NULL,
  `owner_name` varchar(100) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `contact_no` varchar(15) DEFAULT NULL,
  `address` text,
  `profile_image` varchar(255) DEFAULT NULL,
  `aadhaar_card` varchar(255) DEFAULT NULL,
  `pan_card` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_personal_applicant` (`applicant_id`),
  CONSTRAINT `fk_personal_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `vendor_informations` (`applicant_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_personal_details`
--

LOCK TABLES `vendor_personal_details` WRITE;
/*!40000 ALTER TABLE `vendor_personal_details` DISABLE KEYS */;
INSERT INTO `vendor_personal_details` VALUES (1,1,'Aaditya@12',20,'Male','8130424124','knowledge park 2','https://documents.iplt20.com/ipl/IPLHeadshot2025/2.png','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768127358290-64583012.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768127358290-16139507.jpeg'),(2,2,'Bharat',22,'Male','8130424124','Knowledge park 2',NULL,'C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768138486850-303766148.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768138486851-874238709.jpg'),(3,6,'luv',22,'Male','8130424124','knowledge park 2',NULL,'C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768232367076-870271157.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768232367076-180984425.jpg'),(4,7,'Aaditya misra',25,'Male','8130424124','Gandhi nagar',NULL,'C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768583279332-809440632.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768583279333-286117862.jpg'),(5,8,'Amit',26,'Male','8130424124','Greator Noida, 147 sector near metro','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769534107892-432763950.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769534107892-825872908.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769534107893-87218722.jpeg'),(6,9,'Amit',26,'Male','8130424124','Near 147 metro station','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769535170888-562448333.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769535170888-75393873.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769535170888-782887379.jpeg');
/*!40000 ALTER TABLE `vendor_personal_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 11:49:32
