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
-- Table structure for table `vendor_informations`
--

DROP TABLE IF EXISTS `vendor_informations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_informations` (
  `applicant_id` int NOT NULL AUTO_INCREMENT,
  `vendor_user_id` int NOT NULL,
  `vendor_id` varchar(50) DEFAULT NULL,
  `ref_name` varchar(100) DEFAULT NULL,
  `category` enum('pharmacy','pathology','surgery') NOT NULL,
  `category_type` varchar(50) DEFAULT NULL,
  `address` text,
  `druglicense` varchar(100) DEFAULT NULL,
  `gstin` varchar(50) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `active` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `logo` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `delivery_time_minutes` int DEFAULT NULL,
  `delivery_range_km` decimal(5,2) DEFAULT NULL,
  `lat` decimal(10,6) DEFAULT NULL,
  `lng` decimal(10,6) DEFAULT NULL,
  `user_discount` decimal(5,2) DEFAULT '0.00',
  `company_discount` decimal(5,2) DEFAULT '0.00',
  `vendor_offer_user` decimal(5,2) DEFAULT '0.00',
  `company_offer_user` decimal(5,2) DEFAULT '0.00',
  `offer_start_date` date DEFAULT NULL,
  `offer_end_date` date DEFAULT NULL,
  `verified_by` varchar(25) DEFAULT NULL,
  `pan_card` varchar(255) DEFAULT NULL,
  `bank_passbook` varchar(255) DEFAULT NULL,
  `cancelled_cheque` varchar(255) DEFAULT NULL,
  `rating` varchar(255) DEFAULT NULL,
  `reviews` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`applicant_id`),
  KEY `fk_vendor_user` (`vendor_user_id`),
  CONSTRAINT `fk_vendor_user` FOREIGN KEY (`vendor_user_id`) REFERENCES `vendor_signup` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_informations`
--

LOCK TABLES `vendor_informations` WRITE;
/*!40000 ALTER TABLE `vendor_informations` DISABLE KEYS */;
INSERT INTO `vendor_informations` VALUES (1,1,'403412','Aaditya@12','pharmacy','wholesaler','knowledge park 2, sector 54','12455956A','27AAPFU0939F1ZV','8130424124','aadityakuamr@gmail.com',1,1,'2026-01-11 10:28:47','2026-03-22 13:47:36','www.url.com','www.freshgroce.com',50,12.00,NULL,NULL,10.00,10.00,10.00,8.00,'2026-01-11','2026-01-13','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768127327756-419931482.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768127327772-411185504.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768127327772-919841398.jpeg',NULL,NULL),(2,2,'879987','Bharat','pharmacy','wholesaler','knowledge park 2, sector 15 , greator noida','12455956A','27AAPFU0939F1ZV','8130424124','aadityakuamr@gmail.com',1,0,'2026-01-11 13:34:21','2026-03-22 13:47:34','www.url.com','www.freshgroce.com',50,12.00,NULL,NULL,10.00,10.00,10.00,8.00,'2026-01-11','2026-01-13','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768138461431-984746562.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768138461440-180898740.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768138461442-253682324.jpg',NULL,NULL),(3,3,NULL,'sahil','pharmacy','retailer','knowledge park 2, greator noida','12455956A','27AAPFU0939F1ZV','8130424124','aadityakuamr@gmail.com',0,0,'2026-01-11 13:59:37','2026-01-11 13:59:37','www.url.com','www.freshgroce.com',50,12.00,NULL,NULL,10.00,10.00,10.00,8.00,'2026-01-11','2026-01-13','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768139977521-781718579.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768139977525-995863389.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768139977525-180994045.jpg',NULL,NULL),(4,4,NULL,'Tushar','pharmacy','wholesaler','knowledge park 2, sector 15 , greator noida','12455956A','27AAPFU0939F1ZV','8130424124','aadityakuamr@gmail.com',0,0,'2026-01-11 17:10:57','2026-01-11 17:10:57','www.url.com','www.freshgroce.com',50,12.00,NULL,NULL,10.00,10.00,10.00,8.00,'2026-01-11','2026-01-13','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768151456994-885564238.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768151457011-178960827.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768151457011-311207474.jpg',NULL,NULL),(5,6,NULL,'Aaditya Kumar','pharmacy','retailer','Ahir Wada near SBI BANK, badshahpur','13144234','09ABCDE1234F1Z5','8130424124','tushasr@gmail.com',0,0,'2026-01-11 18:49:09','2026-01-11 18:49:09','www.ur.log','www.freshgroce.in',12,5.00,NULL,NULL,10.00,10.00,10.00,10.00,'2026-01-12','2026-01-13','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768157349142-631185119.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768157349151-744577926.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768157349152-388262091.jpg',NULL,NULL),(6,7,NULL,'luv','pharmacy','wholesaler','knowledge park 2, greator noida','12455956A','27AAPFU0939F1ZV','8130424124','aadityakuamr@gmail.com',0,0,'2026-01-12 15:39:02','2026-01-12 15:39:02','www.url.com','www.freshgroce.com',50,12.00,NULL,NULL,10.00,10.00,10.00,8.00,'2026-01-11','2026-01-13','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768232342249-475554254.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768232342251-860435369.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768232342251-579186224.jpg',NULL,NULL),(7,8,'561398','Misra Store','pharmacy','retailer','Misra Store near gandhi nagar','12455956A','27AAPFU0939F1ZV','8130424124','aadityakuamr@gmail.com',1,0,'2026-01-16 17:06:54','2026-03-22 13:47:22','www.misraStore.com','www.misraStore.com',50,12.00,NULL,NULL,10.00,10.00,10.00,8.00,'2026-01-16','2026-01-19','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768583214703-803867632.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768583214713-957415541.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1768583214714-75877568.jpg',NULL,NULL),(8,9,NULL,NULL,'pharmacy','wholesaler','Greator Noida , Near 154 baduali nagar','12455956A','27AAPFU0939F1ZV','8130424124','aadityakuamr@gmail.com',0,0,'2026-01-27 17:14:16','2026-01-27 17:16:16','www.amitStore.com','www.amitStore.com',50,12.00,NULL,NULL,10.00,10.00,10.00,10.00,'2026-01-15','2026-01-18','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769534056161-938418229.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769534056184-899686670.jpg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769534056187-660164445.jpg',NULL,NULL),(9,9,'945148','Amit','pharmacy','wholesaler','Greator Noida 147 sector near metro','13144234','09ABCDE1234F1Z5','8130424124','amitkuamr@gmail.com',1,1,'2026-01-27 17:32:10','2026-03-22 13:47:47','www.amitStore.com','www.amitStore.com',50,10.00,NULL,NULL,10.00,12.00,12.00,10.00,'2026-01-27','2026-01-28','null','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769535130185-586893528.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769535130194-126581478.jpeg','C:\\Users\\Aaditya\\Pictures\\tracoAdmin2 (2)\\DUPLICATE\\backend\\uploads\\vendor-documents\\1769535130194-223119922.jpeg',NULL,NULL);
/*!40000 ALTER TABLE `vendor_informations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 11:49:35
