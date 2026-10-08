package com.ecommerce.thriftauction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@org.springframework.boot.context.properties.ConfigurationPropertiesScan
@EnableScheduling
@EnableAsync
@org.springframework.data.web.config.EnableSpringDataWebSupport(pageSerializationMode = org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class ThriftAuctionApplication {

	public static void main(String[] args) {
		SpringApplication.run(ThriftAuctionApplication.class, args);
	}
}
