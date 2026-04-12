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
-- Table structure for table `rider_signup`
--

DROP TABLE IF EXISTS `rider_signup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rider_signup` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobileNo` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'rider',
  `verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `otp` varchar(10) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rider_signup`
--

LOCK TABLES `rider_signup` WRITE;
/*!40000 ALTER TABLE `rider_signup` DISABLE KEYS */;
INSERT INTO `rider_signup` VALUES (1,'Bharat','aadityakuamr518@gmail.com','8130424124','$2b$10$m4WHC/fxxfTmHBDWEMVfsOzoCg8qxLPfLYz12gW8P3V0eQbhcPDnu','rider',0,'2026-02-19 11:50:17','727286','2026-02-19 17:25:17'),(2,'Bharats','aadityakuamr518@gmail.com','8130424124','$2b$10$qmqrwUGiZzD/TMnot4ZLDOc4o2EEiaWvkX.sE0hTRWaQJKly2HiNe','rider',1,'2026-02-19 11:54:17',NULL,'2026-02-19 17:29:17'),(3,'aditya','aadityakuamr518@gmail.com','8130424124','$2b$10$GH86yYKObCBK8VmujEDFZeU3qYbYCyHHZGI4YI5KreGUMySB1qyBy','rider',1,'2026-02-21 15:53:54',NULL,'2026-02-21 21:28:55'),(4,'Amits','aadityakuamr125@gmail.com','8130424124','$2b$10$aG.G5D8NQjSv0y5Lm5b0quogMgiHM3s5t9RfaTbAwCTVEmM0cfHc6','rider',0,'2026-02-24 11:31:52',NULL,NULL),(5,'Amit','aadityakuamr518@gmail.com','8130424124','$2b$10$jM13hRws5zEofhk9/kilfeaRSDg.j41CwbRJMklqSNz8l.3ZXmHNW','rider',0,'2026-02-24 12:12:19',NULL,NULL),(6,'harsh','harsh123@gmail.com','8130424124','$2b$10$/zlTFXRiw69kPFN0Io.If.U66RFf8Fcgx16jz.RExe03I.lRssske','rider',1,'2026-03-21 05:19:10',NULL,'2026-03-21 10:54:10'),(7,'shivam','shivam@gmail.com','8130424124','$2b$10$MDwHaoHzDfrvQ9x7QRg/L.otoH8SgukU4KLmx.XAlLq/bbYpwh63m','rider',1,'2026-03-21 09:41:00',NULL,'2026-03-21 15:16:00');
/*!40000 ALTER TABLE `rider_signup` ENABLE KEYS */;
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
