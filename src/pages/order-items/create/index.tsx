import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
} from '@chakra-ui/react';
import { useFormik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { useRouter } from 'next/router';
import { createOrderItem } from 'apiSdk/order-items';
import { Error } from 'components/error';
import { OrderItemInterface } from 'interfaces/order-item';
import { orderItemValidationSchema } from 'validationSchema/order-items';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { OrderInterface } from 'interfaces/order';
import { MenuItemInterface } from 'interfaces/menu-item';
import { getOrders } from 'apiSdk/orders';
import { getMenuItems } from 'apiSdk/menu-items';

function OrderItemCreatePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSubmit = async (values: OrderItemInterface, { resetForm }: FormikHelpers<any>) => {
    setError(null);
    try {
      await createOrderItem(values);
      resetForm();
      router.push('/order-items');
    } catch (error) {
      setError(error);
    }
  };

  const formik = useFormik<OrderItemInterface>({
    initialValues: {
      quantity: 0,
      order_id: null,
      menu_item_id: null,
    },
    validationSchema: orderItemValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Create Order Item
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        <form onSubmit={formik.handleSubmit}>
          <FormControl id="quantity" mb="4" isInvalid={!!formik.errors.quantity}>
            <FormLabel>Quantity</FormLabel>
            <NumberInput
              name="quantity"
              value={formik.values.quantity}
              onChange={(valueString, valueNumber) =>
                formik.setFieldValue('quantity', Number.isNaN(valueNumber) ? 0 : valueNumber)
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {formik.errors.quantity && <FormErrorMessage>{formik.errors.quantity}</FormErrorMessage>}
          </FormControl>
          <AsyncSelect<OrderInterface>
            formik={formik}
            name={'order_id'}
            label={'Order'}
            placeholder={'Select Order'}
            fetcher={getOrders}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record.id}
              </option>
            )}
          />
          <AsyncSelect<MenuItemInterface>
            formik={formik}
            name={'menu_item_id'}
            label={'Menu Item'}
            placeholder={'Select Menu Item'}
            fetcher={getMenuItems}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record.id}
              </option>
            )}
          />

          <Button isDisabled={!formik.isValid || formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
            Submit
          </Button>
        </form>
      </Box>
    </AppLayout>
  );
}

export default OrderItemCreatePage;
