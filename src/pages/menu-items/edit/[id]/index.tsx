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
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { useFormik, FormikHelpers } from 'formik';
import { getMenuItemById, updateMenuItemById } from 'apiSdk/menu-items';
import { Error } from 'components/error';
import { menuItemValidationSchema } from 'validationSchema/menu-items';
import { MenuItemInterface } from 'interfaces/menu-item';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { MenuInterface } from 'interfaces/menu';
import { getMenus } from 'apiSdk/menus';

function MenuItemEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<MenuItemInterface>(() => `/menu-items/${id}`, getMenuItemById);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: MenuItemInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updateMenuItemById(id, values);
      mutate(updated);
      resetForm();
      router.push('/menu-items');
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<MenuItemInterface>({
    initialValues: data,
    validationSchema: menuItemValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Edit Menu Item
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        {formError && <Error error={formError} />}
        {isLoading || (!formik.values && !error) ? (
          <Spinner />
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl id="name" mb="4" isInvalid={!!formik.errors.name}>
              <FormLabel>Name</FormLabel>
              <Input type="text" name="name" value={formik.values.name} onChange={formik.handleChange} />
              {formik.errors.name && <FormErrorMessage>{formik.errors.name}</FormErrorMessage>}
            </FormControl>
            <FormControl id="price" mb="4" isInvalid={!!formik.errors.price}>
              <FormLabel>Price</FormLabel>
              <NumberInput
                name="price"
                value={formik.values.price}
                onChange={(valueString, valueNumber) =>
                  formik.setFieldValue('price', Number.isNaN(valueNumber) ? 0 : valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {formik.errors.price && <FormErrorMessage>{formik.errors.price}</FormErrorMessage>}
            </FormControl>
            <FormControl
              id="availability"
              display="flex"
              alignItems="center"
              mb="4"
              isInvalid={!!formik.errors.availability}
            >
              <FormLabel htmlFor="switch-availability">Availability</FormLabel>
              <Switch
                id="switch-availability"
                name="availability"
                onChange={formik.handleChange}
                value={formik.values.availability ? 1 : 0}
              />
              {formik.errors.availability && <FormErrorMessage>{formik.errors.availability}</FormErrorMessage>}
            </FormControl>
            <AsyncSelect<MenuInterface>
              formik={formik}
              name={'menu_id'}
              label={'Menu'}
              placeholder={'Select Menu'}
              fetcher={getMenus}
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
        )}
      </Box>
    </AppLayout>
  );
}

export default MenuItemEditPage;
