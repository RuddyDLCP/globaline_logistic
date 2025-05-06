package com.globaline.logistic.api.globalie_logistic_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
@EntityScan
public class GlobalieLogisticApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(GlobalieLogisticApiApplication.class, args);
	}

}
