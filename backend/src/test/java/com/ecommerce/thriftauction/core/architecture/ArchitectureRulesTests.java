package com.ecommerce.thriftauction.core.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

public class ArchitectureRulesTests {

    private static JavaClasses importedClasses;

    @BeforeAll
    public static void setup() {
        importedClasses = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.ecommerce.thriftauction");
    }

    @Test
    public void domainLayerShouldNotDependOnControllers() {
        noClasses().that()
                .resideInAPackage("..features.order.domain..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("..controller..")
                .check(importedClasses);
    }

    @Test
    public void domainCalculatorShouldNotDependOnRepositories() {
        noClasses().that()
                .haveSimpleName("OrderPricingCalculator")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("..repository..")
                .check(importedClasses);
    }

    @Test
    public void orderResponseMapperShouldNotDependOnRepositories() {
        noClasses().that()
                .haveSimpleName("OrderResponseMapper")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("..repository..")
                .check(importedClasses);
    }

    @Test
    public void servicesShouldNotDependOnControllers() {
        noClasses().that()
                .resideInAPackage("..service..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("..controller..")
                .check(importedClasses);
    }

    @Test
    public void orderControllersShouldNotDependDirectlyOnOrderRepositories() {
        noClasses().that()
                .resideInAPackage("com.ecommerce.thriftauction.features.order.controller..")
                .and().haveSimpleNameNotEndingWith("Test")
                .should()
                .accessClassesThat()
                .resideInAPackage("com.ecommerce.thriftauction.features.order.repository..")
                .check(importedClasses);
    }
}
