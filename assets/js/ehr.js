const cdssURL = "https://fhir-org-cds-services.appspot.com/cds-services/cms-price-check";
const fhirserver = "https://launch.smarthealthit.org/v/r4/fhir";

var b = [];

function createMedicationGrid(bundle, patientId, userid) {
    b = bundle;
    const total = bundle.length;
    const tableData = bundle.map(v => {
        console.log(v);
        return (
            `<tr>
          <td class="text-center">${v.resource.intent}</td>
       <td class="text-center">${v.resource.status}</td>
       <td>${v.resource.medicationCodeableConcept.text}</td>
       <td class="text-center">${formatdate(v.resource.authoredOn)}</td>
       <td class="text-center"><i title="Check Price" class="fa fa-check-square fa-lg text-success pointer checkprice 
                data-cdssURL="${cdssURL}" data-fhirserver="${fhirserver}" 
                data-userid="${userid}" data-patientId="${patientId}"
                data-medicationRequestId="${v.resource.id}"></i></td>
       </tr>`
        );
    }).join('');
    const tableBody = document.querySelector("#body");
    tableBody.innerHTML = tableData;
}

function callCDSServiceCheckPrice(patientId, userId, medicationRequestId) {
    debugger;
    const {
        resource
    } = b.find(f => f.resource.id === medicationRequestId);
    const hookInstance = generateUUID();

    const hook = {
        hookInstance,
        "hook": "order-select",
        fhirserver,
        "context": {

            "userId": `Practitioner/${userId}`,
            "patientId": patientId,
            "selections": [
                `MedicationRequest/${medicationRequestId}`

            ],
            "draftOrders": {
                "resourceType": "Bundle",
                "entry": [{
                    "resource": resource
                }]
            }
        }
    }
    console.log(JSON.stringify(hook))

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: cdssURL,
        data: JSON.stringify(hook)
    }).then(function (response) {
            var cards = response.cards;
            var information = "No price information";
            if (Object.keys(cards).length) {
                information = cards[0].summary;
            }
            document.getElementById("cardinformation").innerText = information;

            $('#card-modal').modal('toggle');

        }


    ).fail(function (err) {
        alert(err.message);
    });
}



// EVENTS LISTENERS
$(document).ready(function () {
    $(document).on('click', '.checkprice', function () {
        callCDSServiceCheckPrice($(this).attr('data-patientId'), $(this).attr('data-userId'), $(this).attr('data-medicationRequestId'))
    });
});


/******************************************************************************/
/****************************** Auxiliary Functions **************************/
/******************************************************************************/


/* Transform date */
function formatdate(date) {
    var dd = date.substring(8, 10);
    var mm = date.substring(5, 7);
    var yyyy = date.substring(0, 4);
    return yyyy + '-' + mm + '-' + dd;
};

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/* Generate UUID */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
