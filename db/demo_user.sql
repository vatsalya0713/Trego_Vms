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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','vendor','manager') NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `activeStatus` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Aaditya12','Aaditya12','$2b$10$5LkzVE8OcX/1l0GJkC/S8ePZr2w6Kbgl0GvNLE0AFPJnwSi/Fk1Am','super_admin','super_admin',NULL,'2026-01-22 18:12:06'),(3,'suraj','Surajs','$2b$10$mDeDu26NSIcvFi/5/wahpOGlnOoqtLJdlvIgP4Q6GBl7rfl/3CgNK','admin','super_admin','Active','2026-01-29 16:38:00'),(4,'Ankit','Ankiy','$2b$10$Kp2dhg//CHHtocYB8iaE8ueO2UxYWaayK8eXfcZiMF8KQkcAq3h32','admin','super_admin','Active','2026-03-21 08:59:34'),(5,'shivan','shivam','$2b$10$MP8GVWjHXFDsd7YD8RKr.eWLKb.q/tgnD2j5GN2m4JRdXHuaLS3vq','admin','super_admin','Active','2026-03-21 11:18:06'),(6,'da','shivadam','$2b$10$sJDm5xDloR3S0HygoAD6A.W0041aoPB41lLUGOYuF8SjBBIeOsVH6','admin','super_admin','Active','2026-03-21 11:20:49'),(7,'csa','da','$2b$10$rxBu4vf4ATO2HQcn2eyNJOy2NGO0PwexSwFO0P4bgPEaKHMOMznei','admin','super_admin','Active','2026-03-21 11:23:20');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
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
