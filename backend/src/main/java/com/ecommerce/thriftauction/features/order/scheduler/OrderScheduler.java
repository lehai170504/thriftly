package com.ecommerce.thriftauction.features.order.scheduler;

import com.ecommerce.thriftauction.features.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderScheduler {

    private final OrderService orderService;

    @Scheduled(fixedRate = 3600000)
    public void autoCancelPendingOrders() {
        log.info("Running Scheduled Job: autoCancelPendingOrders");
        orderService.autoCancelPendingOrders();
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void autoCompleteShippedOrders() {
        log.info("Running Scheduled Job: autoCompleteShippedOrders");
        orderService.autoCompleteShippedOrders();
    }
}
