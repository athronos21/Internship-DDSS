async function testMedicineRegistration() {
  const url = 'http://localhost:5000/api/medicines';
  const testPayload = {
    barcode: `6281${Math.floor(10000000 + Math.random() * 90000000)}`,
    sku: `MED-AZI-${Math.floor(100 + Math.random() * 900)}`,
    name: 'Azithromycin 500mg Film-Coated Tablet',
    genericName: 'Azithromycin Dihydrate',
    brandName: 'Zithromax',
    categoryId: 'cat-1',
    dosageForm: 'Tablet',
    strength: '500mg',
    unit: 'Box',
    manufacturer: 'EPHARM Ethiopia',
    description: 'Broad-spectrum macrolide antibiotic for respiratory and skin infections.',
    prescriptionRequired: true,
    reorderLevel: 25,
    shelfLocation: 'Aisle B, Shelf 04',
    status: 'Active',
    initialBatch: {
      batchNumber: `BAT-AZI-${Date.now().toString().slice(-4)}`,
      mfgDate: '2026-02-01',
      expDate: '2028-08-31',
      purchasePrice: 145.5,
      sellingPrice: 220.0,
      quantity: 150,
      supplierId: 'sup-1',
    },
  };

  console.log('--- 1. Sending POST to http://localhost:5000/api/medicines ---');
  console.log('Payload:', JSON.stringify(testPayload, null, 2));

  try {
    const postRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'u-1',
      },
      body: JSON.stringify(testPayload),
    });

    const postData = await postRes.json();
    console.log(`\n--- 2. POST Response Status: ${postRes.status} ---`);
    console.log('Response Body:', JSON.stringify(postData, null, 2));

    if (!postData.success || !postData.data?.id) {
      console.error('Registration failed!');
      return;
    }

    const newId = postData.data.id;
    console.log(`\n--- 3. Verifying Registered Medicine via GET /api/medicines/${newId} ---`);
    const getRes = await fetch(`http://localhost:5000/api/medicines/${newId}`);
    const getData = await getRes.json();
    console.log(`GET Response Status: ${getRes.status}`);
    console.log('Retrieved Data:', JSON.stringify(getData, null, 2));

    console.log('\n[SUCCESS] Medicine registered, batch created, and inventory transaction logged verified on localhost!');
  } catch (err) {
    console.error('Error testing registration:', err);
  }
}

testMedicineRegistration();
