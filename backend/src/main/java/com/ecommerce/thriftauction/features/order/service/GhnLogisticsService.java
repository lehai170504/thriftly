package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.product.entity.Product;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@Slf4j
public class GhnLogisticsService {

    @Value("${ghn.order-creation-enabled:false}")
    private boolean orderCreationEnabled;

    @Value("${ghn.default-shipping-fee}")
    private BigDecimal defaultShippingFee;

    public Map<String, Object> createShippingOrder(Order order) {
        if (!orderCreationEnabled) {
            log.debug("Automatic GHN order creation is disabled for order {}", order.getId());
            return null;
        }

        throw new IllegalStateException(
                "Automatic GHN order creation cannot be enabled until orders store validated ward, district, and parcel dimensions");
    }

    public BigDecimal calculateShippingFee(Product product, User buyer) {
        return defaultShippingFee;
    }
}
