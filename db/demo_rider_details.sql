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
-- Table structure for table `rider_details`
--

DROP TABLE IF EXISTS `rider_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rider_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rider_applicant_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `vehicle_number` varchar(20) DEFAULT NULL,
  `driving_license_number` varchar(50) DEFAULT NULL,
  `vehicle_photo` varchar(255) DEFAULT NULL,
  `driving_license_photo` varchar(255) DEFAULT NULL,
  `aadhar_card` varchar(50) DEFAULT NULL,
  `pancard` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rider_applicant_id` (`rider_applicant_id`),
  CONSTRAINT `fk_rider_signup` FOREIGN KEY (`rider_applicant_id`) REFERENCES `rider_signup` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rider_details`
--

LOCK TABLES `rider_details` WRITE;
/*!40000 ALTER TABLE `rider_details` DISABLE KEYS */;
INSERT INTO `rider_details` VALUES (1,3,'Aaditya',22,NULL,'8130424124','greator noida',NULL,'21432','14325',NULL,NULL,NULL,NULL,'2026-02-21 17:53:50'),(2,6,'Harsh',21,'Male','8130424124','greator noida','https://res.cloudinary.com/dxoy1r7v8/image/upload/v1774070675/uploads/aovu0tqwgqtoexnjgcfq.jpg','214532','12256','https://res.cloudinary.com/dxoy1r7v8/image/upload/v1774070674/uploads/hp5yfbns7ntdguso4rae.jpg','https://res.cloudinary.com/dxoy1r7v8/image/upload/v1774070675/uploads/bpjehy5oc857ilbk59w0.jpg',NULL,NULL,'2026-03-21 05:24:36'),(3,7,'Shivam',21,NULL,'8130424124','greator noida','https://res.cloudinary.com/dxoy1r7v8/image/upload/v1774086157/uploads/ua9obeevixcxqdpxxie3.jpg','214532','12256','https://res.cloudinary.com/dxoy1r7v8/image/upload/v1774086157/uploads/k7ucfj938u1lmudb45jo.jpg',NULL,NULL,NULL,'2026-03-21 09:42:38');
/*!40000 ALTER TABLE `rider_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 11:49:31
