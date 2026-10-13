package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.order.entity.Order;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GhnLogisticsServiceSafetyTests {

    @Test
    void disabledAutomaticCreationNeverFabricatesTrackingCode() {
        GhnLogisticsService service = service(false);

        assertThat(service.createShippingOrder(Order.builder().id("order-id").build())).isNull();
    }

    @Test
    void enabledAutomaticCreationFailsClosedUntilStructuredShippingDataExists() {
        GhnLogisticsService service = service(true);

        assertThatThrownBy(() -> service.createShippingOrder(Order.builder().id("order-id").build()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("validated ward, district, and parcel dimensions");
    }

    @Test
    void configuredFlatFeeIsExplicitAndDeterministic() {
        GhnLogisticsService service = service(false);

        assertThat(service.calculateShippingFee(null, null)).isEqualByComparingTo("35000");
    }

    private GhnLogisticsService service(boolean enabled) {
        GhnLogisticsService service = new GhnLogisticsService();
        ReflectionTestUtils.setField(service, "orderCreationEnabled", enabled);
        ReflectionTestUtils.setField(service, "defaultShippingFee", new BigDecimal("35000"));
        return service;
    }
}
