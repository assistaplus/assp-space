from typing import (
    Annotated,
    List,
)

from fastapi import (
    APIRouter,
    Body,
    Request,
)

from database.db_models import (
    Profile,
)
from database.profiles_connector import (
    create_db_profile,
    create_db_profiles,
    delete_db_profile,
    delete_db_profiles,
    list_db_departments,
    list_db_profiles,
    retrieve_db_department,
    retrieve_db_profile,
    retrieve_db_profile_by_firebase_uid,
    update_db_profile,
)
from profiles.api_models import (
    DepartmentOut,
    ProfileInCreate,
    ProfileInUpdate,
    ProfileOut,
    ProfileOutPublic,
)
from template.models import (
    BaseResponse,
    Response,
)
from utils.error_handlers import (
    async_error_handlers,
)
from utils.paging import (
    enable_paging,
)

router = APIRouter()


# department operations ##################################################################
class ResponseDepartmentList(BaseResponse):
    data: List[DepartmentOut]

    class Config:
        schema_extra = BaseResponse.schema_wrapper(
            [DepartmentOut.dummy(), DepartmentOut.dummy()]
        )


@router.get(
    "/departments/",
    response_description="List all departments, no paging support",
    response_model=ResponseDepartmentList,
)
@async_error_handlers
async def list_departments(request: Request) -> ResponseDepartmentList:
    db_departments = list_db_departments(request.app.state.sql_engine)
    out_departments: List[DepartmentOut] = [
        DepartmentOut.from_db_model(dep) for dep in db_departments
    ]
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "Department list successfully received",
        "data": out_departments,
    }


class ResponseDepartment(BaseResponse):
    data: DepartmentOut

    class Config:
        schema_extra = BaseResponse.schema_wrapper(DepartmentOut.dummy())


@router.get(
    "/department/{handle}",
    response_description="Get a department by its handle",
    response_model=ResponseDepartment,
)
@async_error_handlers
async def get_department(request: Request, handle: str) -> ResponseDepartment:
    db_model = retrieve_db_department(request.app.state.sql_engine, handle)
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "Retrieved Department successfully",
        "data": DepartmentOut.from_db_model(db_model),
    }


# profile operations #####################################################################
# TODO: department memberships to profile responses


class ResponseProfileList(BaseResponse):
    data: List[ProfileOut]

    class Config:
        schema_extra = BaseResponse.schema_wrapper(
            [
                ProfileOut.dummy(),
                ProfileOut.dummy(),
            ]
        )


# TODO rate limits?
@router.post(
    "/profiles/",
    response_description="Batch add profiles",
    response_model=ResponseProfileList,
)
@async_error_handlers
async def add_profiles(
    request: Request,
    data: Annotated[List[ProfileInCreate], Body(embed=True)],
):
    # TODO test and enable the commented out code
    # roles = await session.get_claim_value(UserRoleClaim)
    # if roles is None or "ADMIN" not in roles:
    #     raise_invalid_claims_exception("User is not an admin", [
    #         ClaimValidationError(UserRoleClaim.key, None)])
    # else:

    new_db_profiles = create_db_profiles(request.app.state.sql_engine, data)
    new_profiles = [ProfileOut.from_db_model(p) for p in new_db_profiles]
    return {
        "status_code": 201,
        "response_type": "success",
        "description": "Created profiles",
        "data": new_profiles,
    }


class ResponseProfile(BaseResponse):
    data: ProfileOut

    class Config:
        schema_extra = BaseResponse.schema_wrapper(ProfileOut.dummy())


@router.post(
    "/profile/", response_description="Add profile", response_model=ResponseProfile
)
@async_error_handlers
async def add_profile(
    request: Request,
    data: Annotated[ProfileInCreate, Body(embed=True)],
) -> ResponseProfile:
    # TODO test and enable the commented out code
    # roles = await session.get_claim_value(UserRoleClaim)
    # if roles is None or "ADMIN" not in roles:
    #     raise_invalid_claims_exception("User is not an admin", [
    #         ClaimValidationError(UserRoleClaim.key, None)])
    # else:

    new_db_profile = create_db_profile(request.app.state.sql_engine, data)
    new_profile = ProfileOut.from_db_model(new_db_profile)
    return {
        "status_code": 201,
        "response_type": "success",
        "description": "Created profile",
        "data": new_profile,
    }


@router.get(
    "/profiles/admin",
    response_description="List all profiles, paging support",
    response_model=ResponseProfileList,
)
@async_error_handlers
@enable_paging(max_page_size=100)
def list_profiles(
    request: Request, page: int = 1, page_size: int = 100
) -> ResponseProfileList:
    # TODO authorization: only presidents / team leads
    db_profiles = list_db_profiles(request.app.state.sql_engine, page, page_size)
    out_profiles: List[ProfileOut] = [ProfileOut.from_db_model(p) for p in db_profiles]
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "Admin Profile list successfully received",
        "data": out_profiles,
    }


class ResponsePublicProfileList(BaseResponse):
    data: List[ProfileOutPublic]

    class Config:
        schema_extra = BaseResponse.schema_wrapper(
            [
                ProfileOutPublic.dummy(),
                ProfileOutPublic.dummy(),
            ]
        )


@router.get(
    "/profiles/",
    response_description="List all profiles, paging support",
    response_model=ResponsePublicProfileList,
)
@async_error_handlers
@enable_paging(max_page_size=100)
def list_public_profiles(
    request: Request, page: int = 1, page_size: int = 100
) -> ResponsePublicProfileList:
    db_profiles = list_db_profiles(request.app.state.sql_engine, page, page_size)
    out_public_profiles: List[ProfileOutPublic] = [
        ProfileOutPublic.from_db_model(p) for p in db_profiles
    ]
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "PublicProfile list successfully received",
        "data": out_public_profiles,
    }


class ResponsePublicProfile(BaseResponse):
    data: ProfileOutPublic

    class Config:
        schema_extra = BaseResponse.schema_wrapper(ProfileOutPublic.dummy())


@router.get(
    "/profile/{profile_id}",
    response_description="Get a public profile by its profile_id",
    response_model=ResponsePublicProfile,
)
@async_error_handlers
async def get_public_profile(
    request: Request, profile_id: str
) -> ResponsePublicProfile:
    db_model = retrieve_db_profile(request.app.state.sql_engine, profile_id)
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "Retrieved public profile successfully",
        "data": ProfileOutPublic.from_db_model(db_model),
    }


@router.get(
    "/profile/{profile_id}/admin",
    response_description="Get a profile by its profile_id",
    response_model=ResponseProfile,
)
@async_error_handlers
async def get_profile(request: Request, profile_id: str) -> ResponseProfile:
    # TODO access control
    db_model = retrieve_db_profile(request.app.state.sql_engine, profile_id)
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "Retrieved profile successfully",
        "data": ProfileOut.from_db_model(db_model),
    }


# TODO test & logic to init profile with firebase_uid id
@router.get(
    "/profile/",
    response_description="Retrieve the complete profile of the user "
    + "currently logged in with FierBase",
    response_model=ResponseProfile,
)
async def show_current_profile(
    request: Request,
) -> ResponseProfile:
    firebase_uid = "TODO"
    db_profile: Profile = retrieve_db_profile_by_firebase_uid(
        request.app.state.sql_engine, firebase_uid
    )
    profile: ProfileOut = ProfileOut.from_db_model(db_profile)
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "Complete internally visible Profile",
        "data": profile,
    }


class ResponseDeletedProfileList(BaseResponse):
    """data contains ids of deleted profiles"""

    data: List[int]

    class Config:
        schema_extra = BaseResponse.schema_wrapper([43, 32])


@router.delete(
    "/profiles/",
    response_description="delete all profiles",
    response_model=ResponseDeletedProfileList,
)
@async_error_handlers
async def delete_profiles(
    request: Request, profile_ids: List[int]
) -> ResponseDeletedProfileList:
    # TODO authorization
    deleted_profiles = delete_db_profiles(request.app.state.sql_engine, profile_ids)
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "Profile list successfully deleted",
        "data": deleted_profiles,
    }


@router.delete(
    "/profile/{profile_id}",
    response_description="delete a profile",
    response_model=Response,
)
@async_error_handlers
async def delete_profile(request: Request, profile_id: int) -> Response:
    # TODO authorization (myself or admin)
    if not delete_db_profile(request.app.state.sql_engine, profile_id):
        return {
            "status_code": 400,
            "response_type": "error",
            "description": "deletion was not possible!",
        }
    return {
        "status_code": 200,
        "response_type": "success",
        "description": "Profile successfully deleted",
    }


@router.patch(
    "/profile/{profile_id}",
    response_description="Update profile",
    response_model=ResponseProfile,
)
@async_error_handlers
async def update_profile(
    request: Request,
    profile_id: int,
    data: Annotated[ProfileInUpdate, Body(embed=True)],
) -> ResponseProfile:
    # TODO authorization
    updated_db_profile = update_db_profile(
        request.app.state.sql_engine, profile_id, data
    )
    # TODO: handle 404
    udpated_profile = ProfileOut.from_db_model(updated_db_profile)
    return {
        "status_code": 201,
        "response_type": "success",
        "description": "Updated profile",
        "data": udpated_profile,
    }


# TODO test endpoint
@router.patch(
    "/profile/",
    response_description="Update logged in users profile",
    response_model=ResponseProfile,
)
@async_error_handlers
async def update_current_profile(
    request: Request,
    data: Annotated[ProfileInUpdate, Body(embed=True)],
) -> ResponseProfile:
    firebase_uid = "TODO"
    db_profile: Profile = retrieve_db_profile_by_firebase_uid(
        request.app.state.sql_engine, firebase_uid
    )
    updated_db_profile = update_db_profile(
        request.app.state.sql_engine, db_profile.id, data
    )
    # TODO: handle 404
    udpated_profile = ProfileOut.from_db_model(updated_db_profile)
    return {
        "status_code": 201,
        "response_type": "success",
        "description": "Updated current profile",
        "data": udpated_profile,
    }
